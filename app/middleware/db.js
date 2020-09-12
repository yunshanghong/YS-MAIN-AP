const {
  buildSuccObject,
  buildErrObject,
  itemNotFound
} = require('../middleware/utils')

/**
 * Builds sorting
 * @param {string} sort - field to sort from
 * @param {number} order - order for query (1,-1)
 */
const buildSort = (sort, order) => {
  const sortBy = {}
  sortBy[sort] = order
  return sortBy
}

/**
 * Hack for mongoose-paginate, removes 'id' from results
 * @param {Object} result - result object
 */
const cleanPaginationID = result => {
  result.docs.map(element => delete element.id)
  return result
}

/**
 * Builds initial options for query
 * @param {Object} query - query object
 */
const listInitOptions = async req => {
  return new Promise(resolve => {
    const order = req.query.order || -1
    const sort = req.query.sort || 'createdAt'
    const sortBy = buildSort(sort, order)
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 5
    const options = {
      sort: sortBy,
      // populate: {
      //   path: 'author',
      //   select: 'displayName photoURL email',
      // },
      populate: [
        {
          path: 'author',
          select: 'displayName photoURL email'
        },
        {
          path: 'speaker',
          select: 'displayName title photoURL website'
        }
      ],
      lean: true,
      page,
      limit
    }
    resolve(options)
  })
}

const getAgeDatetime = age => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - age)

  return date
}

module.exports = {
  /**
   * Checks the query string for filtering records
   * query.filter should be the text to search (string)
   * query.fields should be the fields to search into (array)
   * @param {Object} query - query object
   */
  async checkQueryString(query) {
    return new Promise((resolve, reject) => {
      try {
        if (
          typeof query.filter !== 'undefined' &&
          typeof query.fields !== 'undefined'
        ) {
          const data = {
            $or: []
          }
          const array = []
          // Takes fields param and builds an array by splitting with ','
          const arrayFields = query.fields.split(',')
          // Adds SQL Like %word% with regex
          arrayFields.map(item => {
            array.push({
              [item]: {
                $regex: new RegExp(query.filter, 'i')
              }
            })
          })
          // Apply Condition Search
          if (query.conditions) {
            const arrayCondition = []
            Object.entries(JSON.parse(query.conditions)).forEach(
              ([key, value]) => {
                if (key == 'agePeriod') {
                  if (value === 'age0to15') {
                    const dateAge15Year = getAgeDatetime(15)
                    arrayCondition.push({
                      bob: {
                        $gt: dateAge15Year
                      }
                    })
                  }
                  if (value === 'age16to20') {
                    const dateAge16Year = getAgeDatetime(16)
                    const dateAge20Year = getAgeDatetime(20)
                    arrayCondition.push({
                      bob: {
                        $lte: dateAge16Year,
                        $gt: dateAge20Year
                      }
                    })
                  }
                  if (value === 'age21to25') {
                    const dateAge21Year = getAgeDatetime(21)
                    const dateAge25Year = getAgeDatetime(25)
                    arrayCondition.push({
                      bob: {
                        $lte: dateAge21Year,
                        $gt: dateAge25Year
                      }
                    })
                  }
                  if (value === 'age26to29') {
                    const dateAge26Year = getAgeDatetime(26)
                    const dateAge29Year = getAgeDatetime(29)
                    arrayCondition.push({
                      bob: {
                        $lte: dateAge26Year,
                        $gt: dateAge29Year
                      }
                    })
                  }
                  if (value === 'age30Above') {
                    const dateAge30Year = getAgeDatetime(30)
                    arrayCondition.push({
                      bob: {
                        $lte: dateAge30Year
                      }
                    })
                  }
                }
                else if (key == 'accountStatus'){
                  if (value === 'pass') {
                    arrayCondition.push({
                      loginAttempts: {
                        $lte: 2
                      },
                      isApplyUnlock:{
                        $ne: true
                      }
                    })
                  }
                  if (value === 'locked') {
                    arrayCondition.push({
                      loginAttempts: {
                        $gt: 2
                      },
                      isApplyUnlock: {
                        $ne: true
                      }
                    })
                  }
                  if (value === 'applied') {
                    arrayCondition.push({
                      loginAttempts: {
                        $gt: 2
                      },
                      isApplyUnlock: true
                    })
                  }
                  if (value === 'undefined') {
                    arrayCondition.push({
                      loginAttempts: {
                        $lte: 2
                      },
                      isApplyUnlock: true
                    })
                  }
                }
                else if (value !== 'all') {
                  arrayCondition.push({
                    [key]: value
                  })
                }
              }
            )

            if (arrayCondition.length) {
              data.$and = arrayCondition
            }
          }
          // Puts array result in data
          data.$or = array
          resolve(data)
        } else {
          resolve({})
        }
      } catch (err) {
        console.log(err.message)
        reject(buildErrObject(422, 'ERROR_WITH_FILTER'))
      }
    })
  },

  /**
   * Gets items from database
   * @param {Object} req - request object
   * @param {Object} query - query object
   */
  async getItems(req, model, query) {
    const options = await listInitOptions(req)
    return new Promise((resolve, reject) => {
      model.paginate(query, options, (err, items) => {
        if (err) {
          reject(buildErrObject(422, err.message))
        }
        resolve(cleanPaginationID(items))
      })
    })
  },

  /**
   * Gets item from database by id
   * @param {string} id - item id
   */
  async getItem(id, model) {
    return new Promise((resolve, reject) => {
      model
        .findById(id)
        // .populate({ path: 'author', select: 'displayName photoURL email' })
        .populate({ path: 'author', select: 'displayName photoURL email' })
        .populate({
          path: 'speaker',
          select: 'displayName title photoURL website'
        })
        .exec((err, item) => {
          itemNotFound(err, item, reject, 'NOT_FOUND')
          resolve(item)
        })
    })
  },

  /**
   * Creates a new item in database
   * @param {Object} req - request object
   */
  async createItem(req, model) {
    return new Promise((resolve, reject) => {
      model.create(req, (err, item) => {
        if (err) {
          reject(buildErrObject(422, err.message))
        }
        resolve(item)
      })
    })
  },

  /**
   * Updates an item in database by id
   * @param {string} id - item id
   * @param {Object} req - request object
   */
  async updateItem(_id, model, req) {
    return new Promise((resolve, reject) => {
      model.findByIdAndUpdate(
        _id,
        req,
        {
          new: true,
          runValidators: true
        },
        (err, item) => {
          itemNotFound(err, item, reject, 'NOT_FOUND')
          resolve(item)
        }
      )
    })
  },

  /**
   * Deletes an item from database by id
   * @param {string} id - id of item
   */
  async deleteItem(_id, model) {
    return new Promise((resolve, reject) => {
      model.findByIdAndRemove(_id, (err, item) => {
        itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(buildSuccObject('DELETED'))
      })
    })
  }
}
