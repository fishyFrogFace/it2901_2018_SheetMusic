
describe('Loggin into website', function(){
    it('Visiting home', () => {
        cy.visit('/');
    });

    it('Logging in', () => {
        cy.login();
        cy.visit('/setlist');
    })
});