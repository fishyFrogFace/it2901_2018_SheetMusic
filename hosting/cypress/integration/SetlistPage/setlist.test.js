const setlistName = "Default Setlist";
const setlistDate="2019-04-11";
const setlistTime = "11:00";
const eventName = "Default Event";
const eventDescription = "Default Event Description";
describe('Loggin into website', function(){
    it('Successfully loads and logins', function () {
        cy.visit('/')
        cy.login()
        cy.url().should('include', '/localhost')
    });

    it('Switches to your band page', function () {
        cy.contains('Setlists').click()
        cy.url().should('include', '/setlists')
    });

    it('creating a setlist', () => {
        cy.get('#playlist-add-button').click();
        cy.get("#create-setlist-title").type(setlistName);
        cy.get("#create-setlist-date").type(setlistDate);
        cy.get("#create-setlist-time").type(setlistTime);
        cy.contains('button', 'Create').click();
    });

    it('switch back to main setlist page', () => {
        cy.get("#arrow-back-button").click();
    })

    it('deleting a setlist',() => {
        cy.contains(setlistName).get("#setlist-card-typography").children("#setlist-delete-button").click();
        cy.contains("button","Confirm").click();
    });
});
