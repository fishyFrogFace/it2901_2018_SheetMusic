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
        default:
            return state;
    }
};