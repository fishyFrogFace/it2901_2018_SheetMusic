const setlistTitle = "Default Setlist";
const setlistDate="2019-04-20";
const setlistTime = "11:00";
const eventName = "Default Event";
const eventDescription = "Default Event Description";
const eventTime = 10;

describe('Creating events and scores', () => {
    it('Successfully loads and logins', () => {
        cy.visit('/')
        cy.login()
        cy.url().should('include', '/localhost')
    });

    it('Switches to your setlist page', () => {
        cy.contains('Setlists').click()
        cy.url().should('include', '/setlists')
    });

    it('Creating a default setlist', () => {
        cy.get('#playlist-add-button').click();
        cy.get("#create-setlist-title").type(setlistTitle);
        cy.get("#create-setlist-date").type(setlistDate);
        cy.get("#create-setlist-time").type(setlistTime);
        cy.contains('button', 'Create').click();
    });

    it('Creates an event', () => {
        cy.get("#menu-add-button").click();
        cy.get("#add-event-menu-button").click();
        cy.get("#create-event-name").type(eventName);
        cy.get("#create-event-description").type(eventDescription);
        cy.get("#create-event-time").type(eventTime);
        cy.contains('button', 'Create').click();
    });

    it('Deleted an event', () => {
        cy.contains(eventName).get("#event-card-typography").children("#event-delete-button").click();
        cy.contains('button', 'Confirm').click();
    });

    it('Clears the setlist', () => {
        cy.get("#arrow-back-button").click();
        cy.contains(setlistTitle).get("#setlist-card-typography").children("#setlist-delete-button").click();
        cy.contains('button', 'Confirm').click();
    });
});
