
const bandName = 'Testband'

// Not working 

describe('Creating and deleting a band', function () {
    it('Successfully loads and logins', function () {
        cy.visit('/')
        cy.login()
        cy.url().should('include', '/localhost')
    });

    it('Creates a new band', function () {
        cy.get('#select-band-button').click()
        cy.get('#create-band-button').click()
        cy.get('#dialog-textfield').click().type(bandName)
        cy.contains('button', 'Create').click()
    });
    
    it('Switches to your band page', function () {
        cy.contains('Your band').click()
        cy.url().should('include', '/members')
    });

    it('Checks if the band was created', function () {
        cy.contains('#band-name-title', bandName)
    });

    it('Deleting the band', function () {
        cy.get('#see-more-band-button').click()
        cy.get('#delete-band-button').click()
        cy.contains('button', 'Confirm').click()
    });

    // Not working as it should
    it('Checking for page errors', function () {
        cy.contains('Error').should('not.exist')
        cy.contains('error').should('not.exist')
    });

});
