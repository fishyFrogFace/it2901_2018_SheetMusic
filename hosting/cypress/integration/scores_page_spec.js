describe('The Home Page', function() {
    it('successfully loads', function () {
        cy.visit('/')
    })

    let username = 'oystein.holland@gmail.com';

    it('logs in', function () {
        cy.contains('Sign in with Google').click()

        cy.get('input[type=email]').type(username)

    })
})