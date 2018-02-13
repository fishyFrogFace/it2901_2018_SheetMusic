import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {getArrangementDetail} from "./Arrangement";
import firebase from "firebase";

jest.mock('firebase');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Arrangement', () => {
    it('creates ARRANGEMENT_FETCH_RESPONSE fetching arrangement', async () => {
        const store = mockStore({});

        await store.dispatch(getArrangementDetail('arr_id'));

        const actions = store.getActions();

        expect(actions[0].type).toEqual('ARRANGEMENT_FETCH_RESPONSE');
    })
});