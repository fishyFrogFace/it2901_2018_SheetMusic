
// Testing that all main webpages works
describe('Switching between webpages', function() {
    it('successfully loads and logins', function () {
        cy.visit('/')
        cy.login()
        cy.url().should('include', '/localhost')
    });
    
    it('switches to setlist page', function () {
        cy.contains('Setlists').click()
        cy.url().should('include', '/setlists')
    });

    it('switches to your band page', function () {
        cy.contains('Your band').click()
        cy.url().should('include', '/members')
    });

    it('switches to unsorted pdfs page', function () {
        cy.contains('Unsorted PDFs').click()
        cy.url().should('include', '/pdfs')
    });
});
