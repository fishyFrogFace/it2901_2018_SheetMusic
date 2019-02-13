import React from 'react';
import {
    Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, Step,
    StepLabel,
    Stepper,
    SvgIcon, Typography,
    withStyles
} from "material-ui";
import Dropbox from 'dropbox';
import {ArrowBack} from "material-ui-icons";

const styles = theme => ({});

function StepIcon(props) {
    const extraProps = {};

    if (props.active) {
        extraProps.color = 'secondary';
    } else {
        extraProps.nativeColor = 'rgba(0, 0, 0, 0.38)';
    }

    return props.completed ?
        <SvgIcon color='secondary'>
            <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm-2 17l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z"/>
        </SvgIcon> :
        <SvgIcon {...props} {...extraProps}>
            <circle cx="12" cy="12" r="12"/>
            <text x="12" y="16" textAnchor="middle"
                  style={{fill: '#fff', fontSize: '0.75rem', fontFamily: 'Roboto'}}>{props.number}</text>
        </SvgIcon>;
}

class UploadDialog extends React.Component {
    state = {
        activeStep: 0,
        open: false,
        accessToken: null,
        entries: [],
        selectedPath: ''
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    open(provider) {
        return new Promise(async (resolve, reject) => {
            this.__resolve = resolve;
            this.__reject = reject;

            switch (provider) {
                case 'computer':
                    this.inputRef.click();
                    console.log("Vi er her");
                    break;
                case 'dropbox':
                    const authUrl = new Dropbox.Dropbox({clientId: 'tbg7d2wqxr0ngke'}).getAuthenticationUrl('https://scores-butler.firebaseapp.com/auth');

                    const win = window.open(authUrl, "windowname1", 'width=800, height=600');

                    const url = await new Promise((resolve, reject) => {
                        const pollTimer = setInterval(() => {
                            try {
                                if (win.document.URL.includes('https://scoresbutler-9ff30.firebaseapp.com/auth')) {
                                    clearInterval(pollTimer);
                                    resolve(win.document.URL);
                                    win.close();
                                }
                            } catch (err) {

                            }
                        }, 100);
                    });

                    const [redirectUrl, data] = url.split('#');
                    const parameters = {};
                    for (const param of data.split('&')) {
                        const [key, value] = param.split('=');
                        parameters[key] = value;
                    }

                    const accessToken = parameters['access_token'];

                    this.dropbox = new Dropbox.Dropbox({accessToken: accessToken});
                    const response = await this.dropbox.filesListFolder({path: ''});

                    this.setState({entries: response.entries, open: true, accessToken: accessToken});
                    break;
                case 'drive':
                    this.setState({open: true});
                    break;
            }
        });
    }

    _onFileInputChange = e => {
        this.__resolve({files: e.target.files})
    };

    _onUploadClick = async () => {
        const {selectedPath, accessToken} = this.state;
        this.__resolve({path: selectedPath, accessToken: accessToken});
        this.setState({open: false});
    };

    _onCancelClick = () => {
        this.__reject("Dialog canceled");
        this.setState({open: false});
    };

    _onBackClick = () => {
        const {activeStep} = this.state;
        this.setState({activeStep: activeStep - 1});
    };

    _onEntryClick = async entry => {
        if (entry['.tag'] === 'folder') {
            const response = await this.dropbox.filesListFolder({path: entry.path_lower});
            this.setState({entries: response.entries, selectedPath: entry.path_lower});
        }
    };

    _onArrowBackClick = async () => {
        const {selectedPath} = this.state;
        const newPath = selectedPath.split('/').slice(0, -1).join('/');
        const response = await this.dropbox.filesListFolder({path: newPath});
        this.setState({entries: response.entries, selectedPath: newPath});
    };

    render() {
        const {activeStep, open, entries, selectedPath} = this.state;
        const {classes} = this.props;

        return <div>
            <Dialog open={open}>
                <DialogTitle>Upload</DialogTitle>
                <DialogContent style={{display: 'flex', flexDirection: 'column', height: 500, width: 500}}>
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #f0f0f0'}}>
                        {
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                height: 40,
                                borderBottom: '1px solid #f0f0f0'
                            }}>
                                <IconButton disabled={!selectedPath} onClick={this._onArrowBackClick}>
                                    <ArrowBack/>
                                </IconButton>
                                <Typography variant='body1'>{selectedPath}</Typography>
                            </div>
                        }
                        <List style={{flex: 1}}>
                            {entries.map((entry, index) =>
                                <ListItem key={entry.id} style={{height: 30, padding: '0 20px'}} button disableRipple
                                          onClick={() => this._onEntryClick(entry)}>
                                    <ListItemText primary={entry.path_display}/>
                                </ListItem>
                            )}
                        </List>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={this._onCancelClick}>Cancel</Button>
                    <Button color="secondary" onClick={this._onUploadClick} disabled={!selectedPath}>Upload</Button>
                </DialogActions>
            </Dialog>
            <input id='fileInput' ref={ref => this.inputRef = ref} onChange={this._onFileInputChange} style={{display: 'none'}} type="file" multiple/>
        </div>;
    }
}


export default withStyles(styles)(UploadDialog);