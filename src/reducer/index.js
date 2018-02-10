export default (state = {}, action) => {
    switch (action.type) {
        case 'SIGN_IN_SUCCESS':
            return {...state, user: action.user};
        case 'SIGN_IN_FAILURE':
            return {...state};
        default:
            return state;
    }
};