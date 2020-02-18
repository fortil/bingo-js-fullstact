const App = require('./bootstrap')

if (require.main === module) {
  App.then(app => {
    app.listen(8080, () => console.log('\x1b[32m', `correct listen on port 8080`, '\x1b[0m', ''))
  })
}

