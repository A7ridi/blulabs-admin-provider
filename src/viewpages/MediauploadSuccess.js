import React, { Component } from 'react';
import LoadingIndicator from '../common/LoadingIndicator';
import MediaList from '../viewpages/MediaList'
import Apimanager from '../Apimanager';
// import * as i18n from '../I18n/en.json'

class MediauploadSuccess extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            uservisitObject: null,
            showOverlay: false,
            contentDescriptions: ''
        }
    }

    sharefornewvisit = () => {
        // window.history.replaceState(null, null, `/patient/${this.props.match.params.patientid}`);
        this.props.history.push(`/patient/${this.props.match.params.patientid}/visit/${this.props.match.params.visitid}`, { searchText: this.props.location.state.shearedparams.visitUser.name, patientObj: this.props.location.state.shearedparams.visitUser })
        //this.props.history.push(`/patient/${this.props.match.params.patientid}`);
    }

    showContentDescriptions = (object) => {

        if (object.location) {
            let requestparams = {
                location: object.location
            }
            let params = {
                operationType: 'ready'
            }
            Apimanager.getMediaURL(requestparams, params, success => {
                //console.log('success', success)
                if (success && success.data && success.data.data && success.data.data.signedUrl) {
                    if (object.type.includes('application') || object.type.includes('text')) {
                        this.setState({
                            showOverlay: true,
                            contentDescriptions: object.type.includes('pdf') ? '' : 'This content will be downloaded',
                            medaiPath: success.data.data.signedUrl,
                            mediaType: 'else'
                        })
                    } else {
                        this.setState({
                            showOverlay: true,
                            contentDescriptions: '',
                            medaiPath: success.data.data.signedUrl,
                            mediaType: object.type
                        })
                    }

                }
            }, error => {

                if (error && error.status === 500) {
                    //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
                }
            })
        } else {
            this.setState({
                showOverlay: true,
                contentDescriptions: object.subTitle ? object.subTitle : 'No description exist in this content',
                medaiPath: '',
                mediaType: ''
            })
        }
    }


    closeContentDescription = () => {
        this.setState({
            showOverlay: false
        })
        this.props.showMediaText();
    }

    render() {
        const { isLoading } = this.state;
        return (
            <>
                <MediaList {...this.props} showContentDescriptions={this.showContentDescriptions} />
                <div className="invite-user-page template-page page-done">
                    {this.state.showOverlay ? <div className="overlay">
                        <button type="button" className="btn close-btn" onClick={() => this.closeContentDescription()}><i className="material-icons">close</i></button>
                        {this.state.contentDescriptions ? <div className="content-wrap">
                            {this.state.contentDescriptions}
                        </div> : ''}

                        {(this.state.mediaType.includes("video") || this.state.mediaType.includes("audio")) ? <video width="80%" height="65%" controls src={this.state.medaiPath}></video> : ''}

                        {this.state.mediaType.includes("else") ? <embed src={this.state.medaiPath} width="80%" height="100%" /> : ''}

                        {this.state.mediaType.includes("image") ? <img alt="" src={this.state.medaiPath} width="auto" height="auto" /> : ''}

                        {/* {this.state.mediaType.includes("else") ? <embed src={this.state.medaiPath} width="auto" height="auto" /> : ''} */}
                        <div className="btnbox">
                            <button type="button" className="btn btn-blue-border close-btn" onClick={() => this.closeContentDescription()}>Close</button>
                        </div>

                    </div> : ''}
                    <div className="success">
                        <Thumb />
                        {
                            (isLoading && <LoadingIndicator />)
                            ||
                            <>
                                {/* ${uservisitObject.name} */}
                                <p>{`Your uploaded content is saved successfully.`}</p>
                                <div className="button-wrapper ">
                                    {/* <button type="button" className="btn link-blue mb-0" onClick={() => this.props.changestep(1)} >Share Another For This Visit</button> */}
                                    {/* <button type="button" className="btn link-blue" onClick={() => this.sharefornewvisit()} >Share For A New Visit</button> */}

                                    <div className="row">
                                        <div className="col-sm-6">
                                            <button className="btn btn-blue-border  w-100" onClick={() => this.sharefornewvisit()}>Close</button>
                                        </div>
                                        <div className="col-sm-6">
                                            <button className="btn btn-blue-block w-100" onClick={() => this.props.changestep(1)}>Share More</button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                </div>
            </>
        )
    }
}
export default MediauploadSuccess

var Thumb = (props) => {
    return (
        <svg width="280px" height="500px" viewBox="0 0 417 500" version="1.1" xmlns="http://www.w3.org/2000/svg" >
            <g id="Desktop" stroke="none" fill="none" >
                <g id="Admin---Screen-Share---Submitted" transform="translate(-678.000000, -174.000000)" >
                    <g id="Group" transform="translate(678.000000, 174.000000)">
                        <g>
                            <g transform="translate(0.000000, 100.895401)" fill="#1E7EA4">
                                <path d="M64.7401981,398.256682 L0.257766924,179.290463 L115.228599,145.373762 L179.724596,364.414598 L64.7401981,398.256682 Z M13.9058472,186.731787 L72.1883055,384.608601 L166.083299,356.96649 L107.794058,159.015059 L13.9058472,186.731787 Z M77.1469271,375.525709 L23.0090897,191.683625 L102.84222,168.104735 L156.993624,352.001085 L77.1469271,375.525709 Z M36.6503867,199.118166 L84.5746846,361.877629 L143.33876,344.573328 L95.4008954,181.773165 L36.6503867,199.118166 Z" id="Shape"></path>
                                <path d="M297.978565,314.346764 C293.949261,314.346764 289.74359,314.075431 285.463302,313.539547 C275.132275,312.189662 259.259259,310.853344 240.889974,309.299959 C232.112332,308.567359 222.812373,307.773708 213.349613,306.92579 C204.219238,306.098223 195.692579,305.670872 188.000271,305.670872 C172.310406,305.670872 162.074345,307.339574 156.247456,308.743725 L153.67657,298.053181 C168.538869,294.491928 189.058472,293.671144 214.333198,295.977479 C223.768824,296.825397 233.048433,297.605481 241.805725,298.344865 C260.31746,299.905033 276.29901,301.254918 286.867454,302.638719 C290.666124,303.113553 294.403744,303.357753 297.978565,303.357753 C305.155338,303.357753 322.249356,302.258852 326.048026,292.070275 C327.038394,289.390856 327.669244,286.67752 327.981278,283.77425 L328.354362,280.34188 L331.603582,279.181929 C342.653643,275.261159 350.18315,265.411749 350.800434,254.090354 C350.942884,251.899335 350.820784,249.7965 350.413784,247.591914 L349.721883,243.80681 L353.032153,241.859992 C361.301045,237.016687 366.524217,228.564645 367.0194,219.251119 C367.304301,214.841948 366.517433,210.534527 364.672365,206.389906 L363.064713,202.760819 L366.001899,200.088183 C373.402523,193.365893 377.472527,184.316918 377.472527,174.609958 C377.472527,155.535206 361.965812,140.021707 342.897843,140.014923 C342.89106,140.021707 339.994573,140.06919 335.259802,140.06919 C302.821869,140.06919 261.633428,137.484737 249.61335,125.172975 C246.886447,122.378239 245.495862,119.040836 245.577262,115.506716 C245.611179,110.432777 245.882513,104.551621 246.398046,97.6122643 C246.798263,94.3969611 247.225614,91.5072582 247.652964,88.6853887 C248.297382,84.3915344 248.914666,80.2672636 249.226699,76.4685931 C251.784018,44.6072446 244.451228,24.3182743 236.73857,15.954416 C234.018451,13.003663 231.128748,11.3824447 228.605345,11.3824447 C224.189391,11.3824447 212.053995,13.1189798 208.228192,17.4196174 C207.407407,18.3353683 207.136074,19.1968525 207.271741,20.3839371 C207.699091,24.2707909 211.151811,58.8658255 202.109619,88.3055216 L201.682268,89.309456 C187.762854,114.930132 145.658662,160.955094 120.953738,180.653914 L114.102564,172.066205 C137.871388,153.10677 178.150861,109.204993 191.758242,84.5475512 C199.952517,57.3327907 196.737213,25.2204586 196.350563,21.6320716 C195.848596,17.372134 197.110297,13.3767467 200.006783,10.1207435 C208.418125,0.664767331 228.401845,0.407000407 228.598562,0.407000407 C234.310134,0.407000407 239.913173,3.20851988 244.810745,8.50630851 C256.837607,21.5438882 262.589879,47.286664 260.181794,77.3707774 C259.835843,81.4068647 259.191426,85.7617691 258.519875,90.306607 C258.106091,93.0470764 257.685524,95.8621625 257.326007,98.7111654 C256.857957,105.107855 256.60019,110.751594 256.55949,115.676299 C256.552707,116.001899 256.53914,116.537783 257.475241,117.494234 C264.346764,124.535341 294.878578,129.086962 335.259802,129.086962 C339.933523,129.086962 342.768959,129.032696 342.796093,129.032696 C368.016551,129.032696 388.447972,149.477683 388.447972,174.609958 C388.447972,186.18912 384.093067,197.042464 376.115859,205.541989 C377.669244,210.208927 378.293312,215.018315 377.981278,219.895537 C377.357211,231.623932 371.347171,242.389092 361.714828,249.308099 C361.864062,251.132818 361.877629,252.930403 361.762312,254.748338 C360.968661,269.332519 351.933252,282.186949 338.427622,288.271605 C337.959571,290.883191 337.274454,293.39981 336.345136,295.902863 C331.908832,307.800841 318.281102,314.346764 297.978565,314.346764 Z" id="Path"></path>
                            </g>
                            <g transform="translate(113.607380, 17.785918)" fill="#009ADF">
                                <rect id="Rectangle" x="109.95116" y="0.379867047" width="10.9822276" height="60.1817935"></rect>
                                <path d="M80.6606973,66.6191833 L71.7202551,50.637634 L81.3051146,45.2720119 L90.2455569,61.2535613 L80.6606973,66.6191833 Z M62.7662461,34.6560847 L53.8258038,18.6745353 L63.4174468,13.3089133 L72.357889,29.2904626 L62.7662461,34.6560847 Z" id="Shape"></path>
                                <polygon id="Rectangle" transform="translate(42.309208, 73.103545) rotate(31.526801) translate(-42.309208, -73.103545) " points="12.2215503 67.6090119 72.3968665 67.6090119 72.3968665 78.5980787 12.2215503 78.5980787"></polygon>
                                <path d="M54.9314883,121.665988 L36.6300366,120.933388 L37.0641704,109.95116 L55.365622,110.683761 L54.9314883,121.665988 Z M18.328585,120.194004 L0.0271333605,119.461403 L0.461267128,108.479175 L18.7627188,109.211776 L18.328585,120.194004 Z" id="Shape"></path>
                                <polygon id="Rectangle" transform="translate(40.387011, 157.764876) rotate(63.032673) translate(-40.387011, -157.764876) " points="34.8956831 127.672807 45.8783387 127.672807 45.8783387 187.856946 34.8956831 187.856946"></polygon>
                                <g transform="translate(139.031339, 12.711979)">
                                    <path d="M10.351377,53.9072039 L0.759734093,48.5415819 L9.70695971,32.5600326 L19.2986026,37.9256546 L10.351377,53.9072039 Z M28.2458282,21.9441053 L18.6541853,16.5784832 L27.5946276,0.59693393 L37.1862705,5.96255596 L28.2458282,21.9441053 Z" id="Shape"></path>
                                    <polygon id="Rectangle" transform="translate(48.734476, 60.385697) rotate(58.452555) translate(-48.734476, -60.385697) " points="43.2400173 30.2984461 54.2289353 30.2984461 54.2289353 90.4729472 43.2400173 90.4729472"></polygon>
                                    <path d="M36.0873694,108.954009 L35.6532357,97.9717813 L53.9546873,97.2391806 L54.3888211,108.221408 L36.0873694,108.954009 Z M72.6902727,107.482024 L72.2561389,96.4997965 L90.5575906,95.7671958 L90.9917243,106.749423 L72.6902727,107.482024 Z" id="Shape"></path>
                                    <polygon id="Rectangle" transform="translate(50.620187, 145.045124) rotate(26.936597) translate(-50.620187, -145.045124) " points="20.5295726 139.554062 80.7108019 139.554062 80.7108019 150.536187 20.5295726 150.536187"></polygon>
                                </g>
                            </g>
                            <g transform="translate(375.593542, 161.090761)" fill="#06A6A3" id="Rectangle">
                                <rect x="0.230633564" y="15.5541989" width="41.0120743" height="10.9822276"></rect>
                                <rect x="15.2421652" y="0.549450549" width="10.9822276" height="41.0120743"></rect>
                            </g>
                            <g transform="translate(96.621897, 0.000000)" fill="#E3AC68" id="Rectangle">
                                <rect x="0.420567087" y="15.2285986" width="41.0120743" height="10.9822276"></rect>
                                <rect x="15.4253154" y="0.217066884" width="10.9822276" height="41.0188577"></rect>
                            </g>
                            <g transform="translate(35.571836, 179.731380)" fill="#FF754D" id="Rectangle">
                                <rect x="1.55338489" y="17.4264008" width="41.005291" height="10.9822276"></rect>
                                <rect x="16.5716999" y="2.4013024" width="10.9822276" height="41.0120743"></rect>
                            </g>
                        </g>
                        <path d="M107.834758,442.538326 C97.8021978,442.538326 89.6418396,434.377968 89.6418396,424.345408 C89.6418396,414.312848 97.8021978,406.152489 107.834758,406.152489 C117.867318,406.152489 126.027676,414.312848 126.027676,424.345408 C126.027676,434.377968 117.867318,442.538326 107.834758,442.538326 Z M107.834758,417.1415 C103.859721,417.1415 100.624067,420.377154 100.624067,424.352191 C100.624067,428.327228 103.859721,431.562882 107.834758,431.562882 C111.809795,431.562882 115.045448,428.327228 115.045448,424.352191 C115.045448,420.377154 111.809795,417.1415 107.834758,417.1415 Z" id="Shape" fill="#4091B2"></path>
                    </g>
                </g>
            </g>
        </svg>
    )
}