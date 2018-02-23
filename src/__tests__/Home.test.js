import {getBands, addBand, joinBand} from "../containers/Home";
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import firebase from "firebase";

jest.mock('firebase');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Home', () => {
    it('creates BANDS_FETCH_RESPONSE after fetching bands', async () => {
        const expectedActions = [
            {type: 'BANDS_FETCH_RESPONSE', bands: []}
        ];

        const store = mockStore({});

        await store.dispatch(getBands('user_id'));

        expect(store.getActions()).toEqual(expectedActions)
    });

    it('creates BAND_ADD_SUCCESS after adding band', async () => {
        const store = mockStore({default: {user: {uid: 'uid'}}});

        await store.dispatch(addBand('band_name'));

        let actions = store.getActions();

        expect(actions[0].type).toEqual('BAND_ADD_SUCCESS');
        expect(actions[0].band.name).toEqual('band_name');
        expect(actions[0].band.code.length).toEqual(5);
    });

    it('creates BAND_JOIN_SUCCESS after joining band', async () => {
        const store = mockStore({default: {user: {uid: 'uid'}}});

        firebase.__setMockBand({name: 'name', code: 'code'});

        await store.dispatch(joinBand('code'));

        let actions = store.getActions();

        expect(actions[0].type).toEqual('BAND_JOIN_SUCCESS');
    });
});