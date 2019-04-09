
// Testing login
describe('Logging into website', function() {
    it('successfully loads', function () {
        cy.visit('/')
    });

    it('logs in', function () {
        cy.login()
    });
});
