import React from 'react';

import { withStyles } from "material-ui/styles";
import {
    Avatar, Badge, Card, CardContent, CardMedia, CardActions, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Paper, SvgIcon,
    Typography
} from "material-ui";
import MoreVertIcon from 'material-ui-icons/MoreVert';
import DeleteIcon from 'material-ui-icons/Delete'
import { LibraryMusic, SortByAlpha, ViewList, ViewModule, SkipNext } from "material-ui-icons";
import firebase from 'firebase';


function InstrumentIcon(props) {
    const extraProps = {
        nativeColor: 'rgba(0, 0, 0, 0.38)'
    };

    return <SvgIcon {...props} {...extraProps}>
        <path stroke="null" id="svg_3"
            d="m9.129966,12.700415l-6.509846,5.929c-0.822946,0.774643 -0.842666,2.076245 -0.0435,2.875411c0.80061,0.80061 2.105102,0.779173 2.878965,-0.047327l5.802835,-6.420152l-2.128453,-2.336933z" />
        <path stroke="null" id="svg_6"
            d="m19.14156,6.035508c-0.224411,-0.120582 -0.435234,-0.275096 -0.624424,-0.464286c-0.210237,-0.210276 -0.378184,-0.447027 -0.503881,-0.699631c-0.045062,-0.090592 -0.162949,-0.114412 -0.23718,-0.045687l-5.057634,4.606312l1.984794,1.793925l4.479717,-4.956381c0.066851,-0.072669 0.045648,-0.18755 -0.041391,-0.234252z" />
        <path stroke="null" id="svg_9"
            d="m21.522891,2.565427c-0.296417,-0.296456 -0.690611,-0.459717 -1.109835,-0.459717s-0.813379,0.163301 -1.109835,0.459717c-0.611967,0.611928 -0.611967,1.607664 0,2.21967c0.611967,0.611928 1.607703,0.611928 2.21967,0c0.296456,-0.296456 0.459717,-0.690572 0.459717,-1.109796s-0.163301,-0.813379 -0.459717,-1.109874z" />
        <path stroke="null" id="svg_12"
            d="m21.345103,18.629376l-15.18778,-13.727446c-0.072708,-0.06689 -0.187589,-0.045648 -0.23433,0.041391c-0.120582,0.224411 -0.275096,0.435234 -0.464286,0.624424c-0.210237,0.210198 -0.447027,0.378184 -0.699631,0.503881c-0.090592,0.045062 -0.114412,0.162949 -0.045687,0.237219l13.80359,15.155994c0.774643,0.823024 2.076245,0.842666 2.875411,0.0435c0.800571,-0.80065 0.779173,-2.105102 -0.047288,-2.878965z" />
        <path stroke="null" id="svg_15"
            d="m4.672662,2.561991c-0.296456,-0.296417 -0.690611,-0.459717 -1.109835,-0.459717s-0.813379,0.163301 -1.109835,0.459717c-0.296495,0.296417 -0.459717,0.690611 -0.459717,1.109835s0.163301,0.813379 0.459717,1.109835c0.611967,0.611967 1.607664,0.611967 2.21967,0c0.611928,-0.611967 0.611928,-1.607703 0,-2.21967z" />

        {/*<path d="m18.994131,0.827051c-0.978123,-0.978123 -2.570119,-0.977705 -3.548799,0.000975l-0.63899,0.638897l-0.22957,-0.22957c-0.334258,-0.334258 -0.876174,-0.334258 -1.210432,0s-0.334258,0.876174 0,1.210432l1.196365,1.196365c0.249765,0.249765 0.654728,0.249765 0.904539,0l1.397152,-1.397152c0.197305,-0.197305 0.516939,-0.198651 0.712573,-0.003018c0.195634,0.195634 0.194241,0.515314 -0.003064,0.712573c0,0 -0.815961,0.795534 -0.942608,0.922181l-1.991992,1.845429l-0.327016,-0.327016c-0.337136,-0.337136 -0.886294,-0.368148 -1.238844,-0.04726c-0.376458,0.342614 -0.386764,0.925941 -0.031012,1.281694l0.344704,0.344704l-0.584348,0.584348l-0.327016,-0.327016c-0.337136,-0.337136 -0.886294,-0.368148 -1.238844,-0.04726c-0.376458,0.342614 -0.386764,0.925941 -0.031012,1.281694l0.344704,0.344704l-0.626084,0.626084l-0.327016,-0.327016c-0.337136,-0.337136 -0.886294,-0.368148 -1.238844,-0.04726c-0.376458,0.342614 -0.386764,0.925941 -0.031012,1.281694l0.344704,0.344704l-0.584348,0.584348l-0.327016,-0.327016c-0.337136,-0.337136 -0.886294,-0.368148 -1.238844,-0.04726c-0.376458,0.342614 -0.386764,0.925941 -0.031012,1.281694l0.344704,0.344704l-2.617426,2.617426c-1.992874,1.992874 -1.983497,5.231928 0.007289,7.226148c1.994081,1.992364 5.219996,1.988046 7.213474,-0.005385l0.086582,-0.086582c1.140052,-1.140052 2.620026,-1.838001 4.182218,-2.026022c0.262346,0.135096 0.492613,0.255197 0.702313,0.366013c-0.358863,-2.119846 -0.887409,-5.229421 -1.186152,-6.990264c-0.188484,0.056035 -0.377572,0.11323 -0.562761,0.17646c-0.051067,0.011513 -0.104827,0.02103 -0.158726,0.031894l0.002507,0.018523c-2.406379,0.847298 -4.599948,2.221795 -6.415201,4.030409c-0.362949,0.361649 -0.968466,0.380265 -1.325705,0.013045c-0.348232,-0.357935 -0.347164,-0.928587 0.007057,-1.282855l10.79361,-11.734361l0.428361,-0.506076c0.978494,-0.978726 0.978912,-2.570677 0.000836,-3.548753z"/>*/}
        {/*<path d="m19.329497,19.626237l-0.955766,-5.605036c-0.087604,-0.510478 -0.59057,-0.862578 -1.074159,-0.748085l0.000123,-0.000123c-0.163961,0.016339 -0.300827,0.080708 -0.456495,0.161046c0.029475,0.07418 0.048318,0.148566 0.062193,0.229438l1.206551,7.017009c0.162195,0.043351 0.322954,0.030584 0.456043,0.016051l0.002135,0.002094c0.506619,-0.083787 0.846979,-0.561916 0.759374,-1.072394z"/>*/}
        {/*<path d="m22.451649,5.619101l-5.196469,-5.196469c-0.159881,-0.160095 -0.403226,-0.20172 -0.60708,-0.104275c-0.203961,0.097338 -0.324566,0.312719 -0.300872,0.537492l0.006297,0.059555c0.209938,1.992435 -0.297136,4.175917 -1.42698,6.15437l-8.321095,8.321095c-0.789268,0.789268 -1.07317,1.895738 -0.851492,2.912981l-1.290472,1.290472c-0.836443,0.454136 -1.721021,0.684673 -2.509115,0.644862c-0.221144,-0.011954 -0.425105,0.114521 -0.514759,0.316241c-0.089653,0.201826 -0.045787,0.43802 0.110359,0.593952l2.288824,2.288717c0.102141,0.102247 0.238648,0.156359 0.377397,0.156359c0.001708,0 0.003415,0 0.005123,0c0.293294,-0.001708 0.530555,-0.239929 0.530555,-0.53365c0,-0.024334 -0.001601,-0.048135 -0.004696,-0.071509c-0.031272,-0.811361 0.218263,-1.716965 0.705805,-2.573366l0.873371,-0.873371c0.084744,0.110892 0.177705,0.217516 0.279099,0.318802c1.232411,1.232624 3.238187,1.232624 4.470598,0l7.754786,-7.754786c0.948402,-0.948296 0.948402,-2.491398 0,-3.439907c-0.948509,-0.948296 -2.491611,-0.948402 -3.439907,0.000107l-8.317893,8.31768c0.090827,-0.251242 0.236727,-0.487009 0.437806,-0.688088l8.318533,-8.318533l0.003415,-0.001921c1.688041,-0.964519 3.504585,-1.474368 5.253356,-1.474368c0.322111,0 0.643795,0.017717 0.9563,0.052618c0.021666,0.002455 0.043119,0.003842 0.064892,0.003309c0.29308,-0.001921 0.530128,-0.240142 0.530128,-0.53365c-0.000107,-0.161909 -0.072043,-0.306849 -0.185817,-0.40472zm-6.155331,3.953278c0.449226,-0.449013 1.179686,-0.4488 1.628699,0c0.449013,0.44912 0.449013,1.179793 0.000107,1.628806l-7.754786,7.754786c-0.355197,0.355091 -0.827477,0.550727 -1.329749,0.550727c-0.502271,0 -0.974551,-0.195636 -1.329749,-0.550833c-0.102674,-0.102781 -0.191047,-0.214634 -0.265011,-0.332891l9.050488,-9.050594z"/>*/}
    </SvgIcon>;
}

const styles = {
    root: {},
    card: {
        width: 250,
        height: 260,
        marginRight: 20,
        marginBottom: 20,
        cursor: 'pointer'
    },
    media: {
        height: 150,
    },

    flex: {
        flex: 1
    },

    ellipsis: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'block',
        width: '100%'
    }
};

class Scores extends React.Component {
    state = {
        listView: false,
        band: {},
        score: {},
        parts: {},
        scoreList: []
    };

    unsubs = [];


    componentWillMount() {
        if (window.localStorage.getItem('scoresListView')) {
            this.setState({ listView: true });
        }
    }

    _onViewModuleClick = () => {
        window.localStorage.removeItem('scoresListView');
        this.setState({ listView: false });
    };

    _onViewListClick = () => {
        window.localStorage.setItem('scoresListView', 'true');
        this.setState({ listView: true });
    };

    _onMoreClick = (score) => {
        this.props.onRemoveScore(score);
    };


    _onGetInstrumentName = (band, score) => {

        const scoreList = [];

        const bandRef = firebase.firestore().doc(`bands/${band.id}`);


        // Gets all scores for the band
        const scoreRef = bandRef.collection('scores');

        const scores = scoreRef.get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    //console.log(doc.id, '=>', doc.data());
                    console.log(doc.id);
                    scoreList.push(doc.id);
                });
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });

        console.log('ScoreList:', scoreList);

        // For one special score.id
        const scoreDoc = bandRef.collection('scores').doc(score.id);
        const partsRef = scoreDoc.collection('parts');

        this.unsubs.forEach(unsub => unsub());

        this.unsubs.push(
            partsRef.onSnapshot(async snapshot => {
                const parts = await Promise.all(
                    snapshot.docs.map(async doc => ({
                        ...doc.data(),
                        id: doc.id,
                        instrument: (await doc.data().instrumentRef.get()).data()
                    }))
                );

                this.setState({ score: { ...this.state.score, parts: parts } });

                parts.forEach(part => {
                    console.log(part.instrument.name)
                });
            })
        );

        //console.log('State score:', this.state.score)



        // partsRef.get().then(function (querySnapshot) {
        //     querySnapshot.forEach(function (doc) {

        //         const part = doc.id;
        //         console.log('PartID:', part)

        //         const instRef = doc.data().instrumentRef.id;
        //         console.log(instRef);

        //         const instr = part.instrument.name;
        //         console.log(instr);

        //         console.log(firebase.firestore().collection(`instruments`).doc(doc.id));


        //         // firebase.firestore().collection(`instruments/${instRef}`).get().then(function (querySnapshot) {
        //         //     querySnapshot.forEach(function (doc) {
        //         //         console.log(doc.name);
        //         //     });
        //         // });
        //     });
        // });

        // _______________________________
        // partsRef.get()
        //     .then(res => {
        //         res.forEach(doc => {
        //             let newPart = doc.data().instrumentRef;
        //             partList.push(newPart);

        //         })
        //     })
        //     .catch(err => {
        //         console.log('Error getting documents', err);
        //     });

    };

    _onGetOtherScore = (band) => {
        // Find all scores
        // scoreRef.onSnapshot(snapshot => {
        //     const scores = (
        //         snapshot.docs.map(doc => ({
        //             ...doc.data(),
        //             id: doc.id
        //         }))
        //     );
        //     scoreList = scores;
        //     console.log(scoreList);

        //     // const scoreDoc = bandRef.collection('scores').doc(scores.id);
        //     // const partsRef = scoreDoc.collection('parts');

        //     // partsRef.onSnapshot(async snapshot => {
        //     //     const parts = await Promise.all(
        //     //         snapshot.docs.map(async doc => ({
        //     //             ...doc.data(),
        //     //             id: doc.id,
        //     //             instrument: (await doc.data().instrumentRef.get()).data()
        //     //         }))
        //     //     );

        //     //     //console.log(parts);
        //     //     partList.push(parts);
        //     //     newScore.parts = partList;
        //     // })

        //     // scoreList.push(newScore);



        // })
        // console.log(scoreList);

        // scoreRef.get()
        //     .then(res => {
        //         res.forEach(doc => {
        //             let newScore = doc.data();
        //             newScore.id = doc.id;
        //             // scoreList.push(newScore);

        //             // Find all parts 
        //             const scoreDoc = bandRef.collection('scores').doc(doc.id);
        //             const partsRef = scoreDoc.collection('parts');

        //             partsRef.onSnapshot(async snapshot => {
        //                 const parts = await Promise.all(
        //                     snapshot.docs.map(async doc => ({
        //                         ...doc.data(),
        //                         id: doc.id,
        //                         instrument: (await doc.data().instrumentRef.get()).data()
        //                     }))
        //                 );

        //                 //console.log(parts);
        //                 partList.push(parts);
        //                 newScore.parts = partList;
        //             })

        //             scoreList.push(newScore);
        //         });
        //     })
        //     .catch(err => {
        //         console.log('Error getting documents', err);
        //     });
    }


    // Gets all scores for the band
    _onGetScores = (band) => {
        let allList = [];

        const bandRef = firebase.firestore().doc(`bands/${band.id}`);
        const scoreRef = bandRef.collection('scores');

        // Find all score (from firebase guide)
        const allScores = scoreRef.get()
            .then(snapshot => {
                if (snapshot.empty) {
                    console.log('No matching scores.');
                    return;
                }
                snapshot.forEach(score => {
                    allList = allList.concat({ id: score.id, instruments: {} });

                    const scoreDoc = bandRef.collection('scores').doc(score.id);
                    const partsRef = scoreDoc.collection('parts');

                    // Find all parts
                    const allParts = partsRef.get()
                        .then(snapshot => {
                            if (snapshot.empty) {
                                console.log('No matching parts');
                                return;
                            }

                            snapshot.forEach(part => {
                                //allList[1].instruments.push({ id: part.data().instrumentRef.id })
                            })
                        })
                });
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });


        const { listView } = this.state;
        const hasScores = band.scores && band.scores.length > 0;

        console.log(((allList || {}).id || {}).instrument);
        // const name = ((user || {}).personalInfo || {}).name;

        setTimeout(() => {
            if (allList[0] == undefined) {
                console.log("Loading ...");
            }
            else {
                console.log('Scores', allList);
            }
        }, 3000);

        return (
            <div>
                <div style={{ padding: '0 24px' }}>
                    {
                        <Paper>
                            <List>
                                {allList.map((score, index) =>
                                    <ListItem key={index} dense button
                                        onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}
                                    >
                                        <LibraryMusic color='action' />
                                        <ListItemText
                                            //primary={score.id} 
                                            primary={allList[0].score.instrument}
                                        />
                                    </ListItem>)
                                }
                            </List>
                        </Paper>
                    }
                </div>
            </div>
        )

    };





    render() {
        const { classes, band } = this.props;
        const { listView } = this.state;

        const hasScores = band.scores && band.scores.length > 0;


        //const scoreList = this._onGetScores(band);

        //console.log('Scores:', scoreList);
        // console.log('Parts:', partList);


        return <div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', height: 56 }}>
                <div className={classes.flex} />

                <IconButton>
                    <SortByAlpha />
                </IconButton>

                {
                    listView &&
                    <IconButton onClick={this._onViewModuleClick}>
                        <ViewModule />
                    </IconButton>
                }
                {
                    !listView &&
                    <IconButton onClick={this._onViewListClick}>
                        <ViewList />
                    </IconButton>
                }
            </div>

            <div style={{ padding: '0 24px' }}>
                {
                    listView && hasScores &&
                    <Paper>

                        <List>
                            {band.scores.map((score, index) =>
                                <ListItem key={index} dense button
                                    onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}
                                >
                                    <LibraryMusic color='action' />
                                    <ListItemText
                                        primary={score.title} />

                                    {/* <ListItemSecondaryAction onClick={() => this._onMoreClick}>
                                        <IconButton style={{ position: 'absolute', right: 0 }} onClick={() => this._onMoreClick}>
                                            <MoreVertIcon onClick={() => this._onMoreClick} />
                                        </IconButton>
                                    </ListItemSecondaryAction> */}
                                </ListItem>)

                            }
                        </List>

                        {/* <List>
                            {scoreList.map((score, index) =>
                            <ListItem key={index}>
                            <ListItemText primary={score}/>
                            </ListItem>)
                            }
                        </List> */}


                    </Paper>
                }
                {
                    !listView && hasScores &&
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {band.scores.map((score, index) =>
                            <Card key={index} className={classes.card}
                                onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}
                                elevation={1}>
                                <CardMedia
                                    className={classes.media}
                                    image={score.thumbnailURL || 'http://personalshopperjapan.com/wp-content/uploads/2017/03/130327musicscore-1024x768.jpg'}
                                    title=""
                                    onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}
                                />
                                <CardContent style={{ position: 'relative' }}>
                                    <Typography variant="headline" className={classes.ellipsis}
                                        onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}>
                                        {score.title}
                                    </Typography>
                                    <Typography variant='body1' className={classes.ellipsis}
                                        onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}>
                                        {score.composer}
                                    </Typography>
                                    <Typography variant='body1'
                                        onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}>
                                        {score.partCount} parts
                                    </Typography>
                                    <IconButton style={{ position: 'absolute', top: 63, right: 0 }} onClick={(e) => this._onMoreClick(score, e)}>
                                        <DeleteIcon />
                                    </IconButton>
                                    {/* <Badge style={{position: 'absolute', top: 20, right: 20}} badgeContent={4} color="secondary">*/}
                                    {/*<InstrumentIcon/>*/}
                                    {/*</Badge> */}


                                    {/* instrument: (await doc.data().instrumentRef.get()).data() */}


                                </CardContent>
                            </Card>
                        )}
                    </div>
                }
            </div>
        </div>
    }
}


export default withStyles(styles)(Scores);
