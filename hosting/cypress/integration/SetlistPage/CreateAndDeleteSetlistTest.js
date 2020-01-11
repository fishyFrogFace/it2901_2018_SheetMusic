const setlistTitle = 'Default Setlist';
const setlistDate = '2019-04-11';
const setlistTime = '11:00';

describe('Loggin into website', () => {
    it('Successfully loads and logins', () => {
        cy.visit('/');
        cy.login();
        cy.url().should('include', '/localhost');
    });

    it('Switches to your setlist page', () => {
        cy.contains('Setlists').click();
        cy.url().should('include', '/setlists');
    });

    it('Creating a setlist', () => {
        cy.get('#playlist-add-button').click();
        cy.get('#create-setlist-title').type(setlistTitle);
        cy.get('#create-setlist-date').type(setlistDate);
        cy.get('#create-setlist-time').type(setlistTime);
        cy.contains('button', 'Create').click();
    });

    it('Switch back to main setlist page', () => {
        cy.get('#arrow-back-button').click();
    });

    it('Deleting the setlist', () => {
        cy.contains(setlistTitle)
            .get('#setlist-card-typography')
            .children('#setlist-delete-button')
            .click();
        cy.contains('button', 'Confirm').click();
    });
});
