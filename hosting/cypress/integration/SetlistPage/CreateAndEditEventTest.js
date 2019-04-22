const setlistName = "Default Setlist";
const setlistDate="2019-04-20";
const setlistTime = "11:00";
const eventName = "Default Event";
const eventDescription = "Default Event Description";
const eventTime = 10;
const newEventName = "Updated Event";
const newEventDescription = "Updated Event Description";
const newEventTime = 15;

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

    it('creating a default setlist', () => {
        cy.get('#playlist-add-button').click();
        cy.get("#create-setlist-title").type(setlistName);
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

    it('edits that event', () => {
        cy.contains(eventName).get("#event-card-typography").children("#event-edit-button").click();
        cy.get("#edit-event-title").clear();
        cy.get("#edit-event-description").clear();
        cy.get("#edit-event-time").clear();
        cy.get("#edit-event-title").type(newEventName);
        cy.get("#edit-event-description").type(newEventDescription);
        cy.get("#edit-event-time").type(newEventTime);
        cy.contains('button', 'Save').click();
    });

    it('checks for right data', ()=> {
        cy.contains(newEventName);
        cy.contains(newEventDescription);
        cy.contains(newEventTime);
    });

    it('clears the event', () => {
        cy.contains(newEventName).get("#event-card-typography").children("#event-delete-button").click();
        cy.contains("button","Confirm").click();
    });

    it('clears the setlist', () => {
        cy.get("#arrow-back-button").click();
        cy.contains(setlistName).get("#setlist-card-typography").children("#setlist-delete-button").click();
        cy.contains("button","Confirm").click();
    });
});