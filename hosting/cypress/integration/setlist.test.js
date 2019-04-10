
describe('Loggin into website', function(){
    it('Visiting home', () => {
        cy.visit('/');
    });

    it('Logging in', () => {
        cy.login();
        cy.visit('/setlist');
    });
    it('creating a setlist', ()=> {
        cy.get('button[id=playlistAddButton]').click();
    })
});