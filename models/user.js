var bcrypt = require('bcrypt')
var bcryptComplexity = 10

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('User', {
    'email': {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    'passwordHash': {
      type: DataTypes.TEXT,
      allowNull: false
    },
    'passwordSalt': {
      type: DataTypes.TEXT,
      allowNull: false
    },
    'firstName': {
      type: DataTypes.STRING,
      allowNull: false
    },
    'lastName': {
      type: DataTypes.STRING,
      allowNull: false
    },
    'lastLoginAt': {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['email']
      }
    ],

    instanceMethods: {
      name: function () {
        return [this.firstName, this.lastName].join(' ')
      },

      updatePassword: async function (password) {
        let salt = await bcrypt.genSalt(bcryptComplexity)
        let hash = await bcrypt.hash(password, salt)
        this.passwordHash = hash
        this.passwordSalt = salt
      },

      checkPassword: async function (password, callback) {
        return bcrypt.compare(password, this.passwordHash)
      },

      apiData: function (api) {
        return {
          id: this.id,
          email: this.email,
          firstName: this.firstName,
          lastName: this.lastName
        }
      }
    }
  })
}
