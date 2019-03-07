const puppeteer = require('puppeteer');
const admin = require('firebase-admin');

const serviceAccount = require('./service-account-key');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://scoresbutler-9ff30.firebaseio.com',
    storageBucket: 'scoresbutler-9ff30.appspot.com'
});

/*


#1 As a band member I want to sign in with my Google account

#2

#3

#4

#5

#6 As a band leader I want to upload sheet music PDFs from my computer

#7 As a band leader I want to upload sheet music PDFs from my dropbox

#8 As a band leader I want to create a song item from a multiple single-part PDFs. The song item should contain the song metadata as well as the pages and the name for each single-part PDF.

#9 As a band leader I want to create a song item from a multiple-part PDF. The song item should contain the song metadata as well as the pages and the name for each part in the multiple-part PDF.

#10 As a band leader I want to be able to include name, composer, tempo, tags and genres in the metadata of a song item.

#11 As a band member I want to see a list of the song items in my band

#12 As a band member I want to view the pages of a specific part in a song item

#13 As a band leader I want to see a list of the members of my band

#14 As a band leader I want to create a setlist with a name

#15 As a band leader I want to add song items to a setlist

#16 As a band leader I want to add events (break, speech etc.) to a setlist

#17 As a band member I want to be able to sign out of my account.
 */

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function deleteUser(email) {
    const snapshot = await admin.firestore().collection('users').where('email', '==', email).get();
    if (snapshot.docs.length > 0) {
        await snapshot.docs[0].ref.delete();
    }
}

(async () => {
    await deleteUser('test_user_1@gmail.com');
    await deleteUser('test_user_2@gmail.com');
    await deleteUser('scoresbutler1@gmail.com'); // real one

    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    await page.goto('http://scoresbutler-9ff30.firebaseapp.com', {waitUntil: 'networkidle0'});

    // #1 As a band member I want to sign in with my Google account.
    await userStory1(browser, page);

    // #2 As a band leader I want to be able to create a band.
    const bandCode = await userStory2(browser, page);

    // #3 As a band member I want to join a band
    await userStory3(browser, page, bandCode);

    // #4 As a band leader I want to be able to accept users before they become a band member
    await userStory4();

    // #5 As a band leader I want to be able to remove band members
    await userStory5(browser, page);

    // #5 As a band leader I want to be able to remove band members
    await userStory6(browser, page);

    console.log('done');

    // await browser.close();
})();


async function userStory1(browser, page) {
    // Temporary while testing
    page.evaluate(() => document.querySelector('#test_user_1_signin').click());

    // return new Promise(async resolve => {
    //     const email = 'scoresbutler1@gmail.com';
    //     const password = 'scores-butler';
    //
    //
    //     browser.once('targetcreated', async target => {
    //         const signinPage = await target.page();
    //
    //         await signinPage.waitForSelector('#identifierId');
    //
    //         await signinPage.type('#identifierId', email);
    //         await signinPage.click('#identifierNext');
    //
    //         await delay(2000);
    //
    //         await signinPage.type('input[type="password"]', password);
    //         await signinPage.click('#passwordNext');
    //     });
    //
    //     browser.once('targetdestroyed', () => {
    //         resolve();
    //     });
    //
    //     await page.evaluate(() => {
    //         document.querySelector('.jss7').click();
    //     });
    // });
}


async function userStory2(browser, page) {
    const bandName = 'band1';

    await page.waitForSelector('#create-band-button');

    await page.evaluate(() => {
        document.querySelector('#create-band-button').click();
    });

    await page.waitForSelector('div[role="dialog"]');

    await page.type('div[role="dialog"] input', bandName);

    await page.evaluate(() => {
        document.querySelectorAll('div[role="dialog"] button')[1].click();
    });

    await page.waitForFunction(bandName => document.querySelector('#select-band-button').textContent === bandName, {polling: 'mutation'}, bandName);

    await page.evaluate(() => {
       document.querySelector('ul > div:nth-of-type(3)').click();
    });

    await page.waitForSelector('li');

    return await page.evaluate(() => {
        return /Band code: ([a-z0-9]{5})/.exec(document.body.textContent)[1]
    });
}

async function userStory3(browser, page, bandCode) {
    const context = await browser.createIncognitoBrowserContext();
    const newPage = await context.newPage();
    await newPage.goto('http://scoresbutler-9ff30.firebaseapp.com', {waitUntil: 'networkidle0'});

    newPage.evaluate(() => document.querySelector('#test_user_2_signin').click());

    await newPage.waitForSelector('#join-band-button');

    await newPage.evaluate(() => {
        document.querySelector('#join-band-button').click();
    });

    await newPage.waitForSelector('div[role="dialog"]');

    await newPage.type('div[role="dialog"] input', bandCode);

    await newPage.evaluate(() => {
        document.querySelectorAll('div[role="dialog"] button')[1].click();
    });

    await newPage.waitForFunction(() => Boolean(document.querySelector('#select-band-button').textContent), {polling: 'mutation'});
}

async function userStory4(browser, page) {

}

async function userStory5(browser, page) {

}

async function userStory6(browser, page) {

}