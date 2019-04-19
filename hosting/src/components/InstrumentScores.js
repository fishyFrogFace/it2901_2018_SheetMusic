import React from 'react';
import { ListItem, ListItemText } from "material-ui";
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

// !!!!!!!! TODO: Check if we need this component !!!!!!!!!!!!!!
// !!!!!!!!!!!! this component is not used at the moment !!!!!!!!!!!

class InstrumentScores extends React.Component {
    // constructor(props) {
    //     super(props)

    // }


    render() {
        const { classes, vocalInstruments, matching } = this.props
        let types = []


        console.log('matching', matching)

        Object.keys(vocalInstruments).forEach(function (key) {
            //const matches = vocalInstruments[key].filter(s => s.includes(key)); // filter out the instrument parts not match the instrument
            //finalDict[key] = [matches] // create the final dictionary with all instrument and associated instrument part/vocal
            //console.log('finalDict', finalDict)
        });

        // Object.keys(vocalInstruments).forEach((instr) =>

        //     console.log('vocalInstruments[instr][0]', (vocalInstruments[instr][0]).includes(instr))




        // );
        // console.log('this.props.test.liste', this.props.test.liste)

        for (var i in vocalInstruments) {
            vocalInstruments[i].forEach(function (elem, index) {
                // console.log(elem, index);
            });
        }


        for (let item in vocalInstruments) {
            //console.log('item', item)
            var obj = vocalInstruments[item];
            //console.log('obj', obj)
            obj.forEach(element => {

                types.push(element)
            });
            if (vocalInstruments.hasOwnProperty(item)) {
                //console.log('item', item)
            }

        }


        // types.map((item, key) => {
        //         console.log('instr', instr)
        //     )

        // })


        return <div>

            {
                // map over parts/tone
                types.map((item, key) =>
                    //console.log('key: ', key, 'item:', item, 'instruments: ', instruments)


                    <ListItem>
                        {types[key] !== undefined && types[key].map((instr, index) =>

                            // matching.length > 0 &&
                            <ListItemText primary={instr} className={classes.instrumentstyle} key={index}>  </ListItemText>)
                        }

                    </ListItem>
                )
            }
            {/* {
                // map over parts/tone
                <ListItem>
                    {this.props.test.liste.map((instr, index) =>
                        <ListItemText primary={instr} className={classes.instrumentstyle} key={index}>  </ListItemText>)}
                    {/* <img src={this.props.band.scores[3].parts[0].pages[0].croppedURL}></img> */}
            {/* </ListItem>
            } */}
            <div>
            </div>
        </div>
    }
}

export default withStyles(styles)(InstrumentScores);