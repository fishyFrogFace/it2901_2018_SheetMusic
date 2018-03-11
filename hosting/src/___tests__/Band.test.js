import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {addArrangement, getBandDetail} from "../containers/Home";
import firebase from "firebase";

jest.mock('firebase');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('async actions', () => {
    xit('creates ARRANGEMENT_ADD_SUCCESS after adding arrangment', async () => {
        const store = mockStore({
            default: {
                user: {
                    uid: 'uid'
                }
            },
            router: {
                location: {
                    pathname: '/band/band_id'
                }
            }
        });

        await store.dispatch(addArrangement('title', 'composer'));

        const actions = store.getActions();

        expect(actions[0].type).toEqual('ARRANGEMENT_ADD_SUCCESS');
        expect(actions[0].arrangement.title).toEqual('title');
        expect(actions[0].arrangement.composer).toEqual('composer');
    });

    xit('creates BAND_FETCH_RESPONSE after fetching band', async () => {
        const store = mockStore({});

        await store.dispatch(getBandDetail('band_id'));

        const actions = store.getActions();

        expect(actions[0].type).toEqual('BAND_FETCH_RESPONSE');
    })
});