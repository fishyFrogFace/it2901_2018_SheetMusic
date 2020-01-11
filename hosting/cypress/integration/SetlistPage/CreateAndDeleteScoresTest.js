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

    //Should be implemented differently for more than one score
    it('Adds a score', () => {
        cy.get('#menu-add-button').click();
        cy.get('#add-score-menu-button').click();
        cy.get('#scores-checkbox-button').click();
        cy.contains('button', 'Add').click();
    });

    //Should be implemented differently for more than one score
    it('Deletes that score', () => {
        cy.get('#score-delete-button').click();
        cy.contains('button', 'Confirm').click();
    });

    it('Clears the setlist', () => {
        cy.get('#arrow-back-button').click();
        cy.contains(setlistTitle)
            .get('#setlist-card-typography')
            .children('#setlist-delete-button')
            .click();
        cy.contains('button', 'Confirm').click();
    });
});
