import React from 'react';
import {
    Button, Chip, CircularProgress, Divider, List, ListItem, ListItemText, Paper, Typography
} from "material-ui";

import { withStyles } from "material-ui/styles";

import AddPartsDialog from "../../components/dialogs/AddPartsDialog";
import AddFullScoreDialog from "../../components/dialogs/AddFullScoreDialog";

const styles = theme => ({
    checkbox__checked: {
        color: theme.palette.secondary.main
    },

    root: {},

    flex: {
        flex: 1
    },

    selectable__root: {
        height: 250,
        width: 250,
        marginRight: 20,
        marginBottom: 20
    },

    flexWrapContainer: {
        display: 'flex',
        paddingTop: 20,
        paddingLeft: 20,
        flexWrap: 'wrap',
        boxSizing: 'border-box',
        alignContent: 'flex-start'
    },

    checkboxWrapper: {
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

/**
 * React component for the page for uploading of PDFs. Displays unsorted PDFs, i.e PDFs that has been uploaded, but are
 * not yet given all required information and added to the band's library. The PDFs can either be removed or given all
 * information through dialogs by clicking "Add parts to score".
 */


class UnsortedPDFs extends React.Component {
    state = {
        bandAnchorEl: null,
        uploadAnchorEl: null,
        accountAnchorEl: null,
        uploadSheetsDialogOpen: false,
        message: null,
        windowSize: null,
        bandtypes: [],
        band: {},
        bands: null,

        userData: {},
        pdfSelected: false,
        scoreInfo: []
    };

    _onAddParts = async pdfs => {
        const { score, parts, tune } = await this.addPartsDialog.open(pdfs);
        this.props.onAddParts(score, parts, tune);
    };

    // 
    _onAddFullScore = async pdf => {
        const { score, parts } = await this.addFullScoreDialog.open(pdf);
        this.props.onAddFullScore(score, parts, pdf);
    };

    _onRemoveUnsortedPdf = async pdf => {
        this.props.onRemoveUnsortedPdf(pdf);
    };


    render() {
        const { band } = this.props;

        let hasInstruments = false;

        // Checks if any of the PDFs has instruments
        if (band.pdfs) {
            band.pdfs.forEach(pdf => {
                if (pdf.type === 'full' && pdf.pdf.parts) {
                    pdf.pdf.parts.map(part => {
                        if (!part.instrument.length) {
                            hasInstruments = true;
                        }
                    })
                }
            })
        }


        return <div>
            <div style={{ paddingTop: 20, paddingLeft: 20 }}>
                {
                    band.pdfs && band.pdfs.map(group => {
                        switch (group.type) {

                            case 'full':
                                return <Paper key={group.pdf.id}
                                              style={{
                                                  marginRight: 20,
                                                  marginBottom: 20,
                                                  position: 'relative'
                                              }}>
                                    <div style={{
                                        padding: '10px 20px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <Typography variant='body2'>{group.name}</Typography>
                                        <div style={{ flex: 1 }} />
                                        <div style={{position: 'relative' }}>
                                            <Button
                                                color='secondary'
                                                onClick={() =>
                                                    this._onAddFullScore(group.pdf)
                                                }
                                                disabled={group.pdf.processing}
                                            >
                                                Create full score
                                            </Button>
                                            <Button
                                                color='secondary'
                                                onClick={() =>
                                                    this._onRemoveUnsortedPdf(group)
                                                }
                                            >
                                                Remove
                                            </Button>

                                            {group.pdf.processing && <CircularProgress color='secondary'
                                                                                       style={{
                                                                                           position: 'absolute',
                                                                                           top: '50%',
                                                                                           left: '0%',
                                                                                           marginTop: -12,
                                                                                           marginLeft: -12 }}
                                                                                       size={24}/>
                                            }
                                        </div>
                                    </div>
                                    <Divider />
                                    <div style={{
                                        display: 'flex',
                                        paddingTop: 10,
                                        paddingLeft: 10,
                                        flexWrap: 'wrap'
                                    }}
                                    >
                                        {
                                            hasInstruments && group.pdf.parts.map((part, i) =>
                                                <Chip key={i} style={{ marginRight: 10, marginBottom: 10 }}
                                                    label={'part.instrument'} >
                                                </Chip>
                                            )
                                        }
                                        {
                                            !hasInstruments && <Typography style={{
                                                                                marginLeft: 10,
                                                                                marginBottom: 10,
                                                                                color: 'rgba(0,0,0,.54)'
                                                                            }}
                                            >
                                                No instruments detected.
                                            </Typography>
                                        }
                                    </div>
                                </Paper>;

                            case 'part':
                                return <Paper key={group.name}
                                              style={{
                                                  marginRight: 20,
                                                  marginBottom: 20,
                                                  position: 'relative'
                                              }}
                                >
                                    <div style={{
                                        padding: '10px 20px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    >
                                        <Typography variant='body2'>{group.name}</Typography>
                                        <div style={{ flex: 1 }} />
                                        <div style={{ position: 'relative' }}>
                                            <Button color='secondary'
                                                    disabled={group.pdfs.some(pdf => pdf.processing)}
                                                    onClick={() =>
                                                        this._onAddParts(group.pdfs
                                                        )}
                                            >
                                                Add parts to score
                                            </Button>
                                            <Button color='secondary'
                                                    onClick={() =>
                                                        this._onRemoveUnsortedPdf(group)
                                                    }
                                            >
                                                Remove
                                            </Button>
                                            {group.pdfs.some(pdf => pdf.processing) && <CircularProgress color='secondary'
                                                                                                         style={{
                                                                                                             position: 'absolute',
                                                                                                             top: '50%',
                                                                                                             left: '0%',
                                                                                                             marginTop: -12,
                                                                                                             marginLeft: -12
                                                                                                         }}
                                                                                                         size={24}
                                            />}
                                        </div>
                                    </div>
                                    <Divider />
                                    <List>
                                        {
                                            group.pdfs.map(pdf =>
                                                <ListItem key={pdf.id}
                                                          style={{
                                                              height: 40,
                                                              padding: '10px 20px'
                                                          }}
                                                >
                                                    <ListItemText primary={pdf.name} />
                                                </ListItem>
                                            )
                                        }
                                    </List>
                                </Paper>
                        }
                    })
                }
            </div>
            <AddPartsDialog band={band} onRef={ref => this.addPartsDialog = ref} />
            <AddFullScoreDialog band={band} onRef={ref => this.addFullScoreDialog = ref} />
        </div>;
    }
}

export default withStyles(styles)(UnsortedPDFs);
