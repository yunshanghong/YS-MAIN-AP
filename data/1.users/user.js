const faker = require('faker')
const ObjectID = require('mongodb').ObjectID

module.exports = [
  {
    /* Admin */
    _id: new ObjectID('5d52f7908066740cc0b02022'),
    role: 'admin',
    photoURL: "assets/images/avatars/penguin.png",
    verified: true,
    shortcuts: [
      "ys-home",
      "ys-faq"
    ],
    active: true,
    loginAttempts: 0,
    google: {
      _id: new ObjectID('5d5e5e2a90d5070dcd647978'),
      id: "115531838829596190717",
      accessToken: "ya29.Gl1sBxkpa7Zxni4418u9kokf2aAhOxkElcg5GGpBTA6zy_i8TMrzFrD_MkN5JR6pKcJ7OOHbRkCDM1pQK5t7wMPAwHzBC-XWfxoPqikvuJnr8e-Py7pVsRwZzfABzMI",
      displayName: "paul J",
      email: "pauljiang61020@gmail.com",
      photoURL: "https://lh3.googleusercontent.com/a-/AAuE7mCVgg5ho9md10l6GVdMtFB26p5CAdiH4p_49O7vlQ=s96-c"
    },
    facebook: null,
    displayName: "paul",
    email: "pauljiang61020@gmail.com",
    password: "$2a$05$Rb7PelNi6bfOeDfPRKWcruIqqOOiEU/vw0qx9UPaY0uzS1u8rZtcK",
    verification: "d9490d74-d495-4186-a363-6d977d17c097",
    blockExpires: "2019-08-13T17:46:56.270Z",
    referralCode: "VoxfMENCu",
    referralList: [],
    bob: "1995-08-22T16:00:00.000Z",
    city: "宜蘭縣",
    departmentName: "cs",
    education: "bachelor",
    employmentStatus: "employed",
    fullName: "paul",
    gender: "diversity",
    phone: "(09) 0809-1511",
    schoolName: "nttu",

    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  },
  {
    /* test1 */
    _id: new ObjectID('5d54ce8ea11d85194bf16c4f'),
    role: "user",
    photoURL: "assets/images/avatars/penguin.png",
    verified: false,
    shortcuts: [
      "ys-home"
    ],
    active: true,
    loginAttempts: 0,
    google: null,
    facebook: null,
    displayName: "test1",
    email: "test1@gmail.com",
    password: "$2a$05$TfT9NDLx/WFyGwM6odHne.PEim8Fb54QORXVlJF7W0CqDPxbXYyc.",
    verification: "b8b0a6d7-fb96-4d6b-93f2-26e359379363",
    blockExpires: "2019-08-15T03:16:30.953Z",
    referralCode: "KIAG4dyga",
    referralList: [],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  },
  {
    /* test2 */
    _id: new ObjectID('5d54cea0a11d85194bf16c57'),
    role: "user",
    photoURL: "assets/images/avatars/penguin.png",
    verified: false,
    shortcuts: [
      "ys-home"
    ],
    active: true,
    loginAttempts: 0,
    google: null,
    facebook: null,
    displayName: "test2",
    email: "test2@gmail.com",
    password: "$2a$05$eSbN5Uv.CpM1IQLyXaoHVu8VOtFBFnpmVq9Mf0MrEZ9THrbO3fxry",
    verification: "199d4588-a226-4875-bbf7-8a08c45de27b",
    blockExpires: "2019-08-15T03:16:48.770Z",
    referralCode: "_UtB6H5mD",
    referralList: [],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  },
]
