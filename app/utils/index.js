module.exports = {
  genderConverter: gender => {
    switch (gender) {
      case 'male':
        return '男性';
      case 'female':
        return '女性';
      case 'diversity':
      default:
        return '多元性別';
    }
  },
  educationConverter: education => {
    switch (education) {
      case 'middle':
        return '國中';
      case 'high':
        return '高中';
      case 'vocational':
        return '高職';
      case 'faculty':
        return '專科';
      case 'bachelor':
        return '大學(包含四技、二技)';
      case 'institute':
        return '研究所';
      case 'other':
      default:
        return '其他';
    }
  },

  departmentNameConverter: departmentName => {
    switch (departmentName) {
      case 'Informatics Group':
        return '資訊學群';
      case 'Engineering Group':
        return '工程學群';
      case 'Mathematical Chemistry Group':
        return '數理化學群';
      case 'Medical Hygiene Group':
        return '醫藥衛生學群';
      case 'Life Science Group':
        return '生命科學學群';
      case 'Agriculture Forestry Fishery and Animal Husbandry':
        return '農林漁牧學群';
      case 'Earth and Environment':
        return '地球與環境學群';
      case 'Architecture and Design Group':
        return '建築與設計學群';
      case 'Art group':
        return '藝術學群';
      case 'Social and Psychological Group':
        return '社會與心理學群';
      case 'Mass Communication Group':
        return '大眾傳播學群';
      case 'Foreign language group':
        return '外語學群';
      case 'Literature and History Philosophy Group':
        return '文史哲學群';
      case 'Educational Group':
        return '教育學群';
      case 'School of Law and Politics':
        return '法政學群';
      case 'Management Studies':
        return '管理學群';
      case 'Finance and Economics Group':
        return '財經學群';
      case 'Sports Leisure Group':
        return '體育休閒學群';
      case 'other':
      default:
        return '其他學群';
    }
  },

  statusConverter: statsu => {
    switch (statsu) {
      case 'student':
        return '在學中';
      case 'employed':
        return '在職中';
      case 'unemployed':
        return '待業中';
      case 'other':
      default:
        return '其他';
    }
  }
}