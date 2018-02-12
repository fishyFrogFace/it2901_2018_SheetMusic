export default (state = {}, action) => {
    switch (action.type) {
        case 'SIGN_IN_SUCCESS':
            return {...state, user: action.user};
        case 'SIGN_IN_FAILURE':
            return {...state};
        case 'USER_CREATE_SUCCESS':
            return {...state};
        case 'BANDS_FETCH_RESPONSE':
            return {...state, bands: action.bands};
        case 'BAND_FETCH_RESPONSE':
            return {...state, band: action.band};
        case 'BAND_ADD_SUCCESS':
            return {...state, bands: [...state.bands, action.band]};
        case 'BAND_JOIN_SUCCESS':
            return {...state, bands: [...state.bands, action.band]};
        case 'BAND_JOIN_FAILURE':
            return state;
        case 'ARRANGEMENT_FETCH_RESPONSE':
            return {...state, arrangement: action.arrangement};
        case 'ARRANGEMENT_ADD_SUCCESS':
            return {...state, arrangements: [...state.arrangements, action.arrangement]};
        default:
            return state;
    }
};