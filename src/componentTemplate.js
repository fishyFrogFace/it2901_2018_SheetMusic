import React from 'react';

import {withStyles} from "material-ui/styles";

const styles = {
    root: {}
};

class MyComponent extends React.Component {
    state = {
    };

    render() {
        const {classes} = this.props;
        return <></>;
    }
}


export default withStyles(styles)(MyComponent);