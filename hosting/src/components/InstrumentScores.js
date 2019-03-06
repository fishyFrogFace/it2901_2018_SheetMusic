import React from 'react';
import { List, ListItem, ListItemText } from "material-ui";
import { LibraryMusic, SortByAlpha, ViewList, ViewModule } from "material-ui-icons";
import { withStyles } from "material-ui/styles";


const styles = {
    instrumentstyle: {
        borderStyle: 'groove',
        borderWidth: '1px',
        padding: '8px',
        margin: '5px',
        cursor: 'pointer',
        minWidth: '80px',
        textAlign: 'center',
        '&:first-child': {
            paddingLeft: '8px',
        }
    },

}



class InstrumentScores extends React.Component {
    constructor(props) {
        super(props)

    }

    // componentWillMount() {
    //     this.props._onGetParts(this.state.testList)
    // }


    onChangeTest() {
        this.props._onGetParts(this.state.testList);
    }

    render() {
        const { classes, band, instruments, index } = this.props;
        //console.log('this.props', this.props)
        //console.log('this.state.testList', this.props.testList)
        return <div>
            {
                // map over parts/tone
                <ListItem>
                    {this.props.test.liste.map((instr, index) =>
                        <ListItemText primary={instr} className={classes.instrumentstyle} key={index}>  </ListItemText>)}
                    {/* <ListItemText primary='instrument-tone1' className={classes.instrumentstyle} />
                        <ListItemText primary='instrument-tone2' className={classes.instrumentstyle} />
                        <ListItemText primary='instrument-tone3' className={classes.instrumentstyle} />
                        <ListItemText primary='instrument-tone4' className={classes.instrumentstyle} />  */}
                </ListItem>
            }<div>
                {/* {Object.keys(this.props.testList).map((key, index) => {
                    return (
                        <div key={index}>
                            {index}: {this.props.testList[index]}
                        </div>
                    )
                }
                )} */}
            </div>
        </div>
    }
}








export default withStyles(styles)(InstrumentScores);