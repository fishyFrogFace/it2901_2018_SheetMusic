const setlistTitle = 'Default Setlist';
const setlistDate = '2019-04-11';
const setlistTime = '11:00';
const newSetlistTitle = 'Updated Setlist';
const newSetlistDate = '2019-04-22';
const newSetlistTime = '11:30';

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

    it('Edits that setlist', () => {
        cy.get('#menu-edit-button').click();
        cy.get('#edit-setlist-title').clear();
        cy.get('#edit-setlist-title').type(newSetlistTitle);
        cy.get('#edit-setlist-date').type(newSetlistDate);
        cy.get('#edit-setlist-time').type(newSetlistTime);
        cy.contains('button', 'Save').click();
    });

    it('Checks for correct data', () => {
        cy.contains(newSetlistTitle);
        cy.contains(newSetlistDate);
        cy.contains(newSetlistTime);
    });

    it('Clears the setlist', () => {
        cy.get('#arrow-back-button').click();
        cy.contains(newSetlistTitle)
            .get('#setlist-card-typography')
            .children('#setlist-delete-button')
            .click();
        cy.contains('button', 'Confirm').click();
    });
});
