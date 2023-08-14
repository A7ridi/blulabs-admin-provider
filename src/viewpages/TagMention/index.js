import React from "react";
import BaseComponent from "../../components/BaseComponent";
import Apimanager from "../../Apimanager/index";
import LoadingIndicator from "../../common/LoadingIndicator";
import ReactHtmlParser from 'react-html-parser';

function reverseString(str) {
   if (str) {
      return str.split("").join("");
   } else {
      return "";

   }
}


class MentionDetails extends BaseComponent {
   constructor(props) {
      super(props)
      this.state = {
         data: [],
         hashTagData: [],
         mentionData: [],
         loading: true,
         id: ""
      }
   }

   componentDidMount() {

      if (this.props.tagType === "hash") {
         this.getHashTagData(this.props.id);
      }
      if (this.props.tagType === "mention") {
         this.getMentionData(this.props.id);
      }
      this.setState({
         id: this.props.id
      })
   }

   UNSAFE_componentWillReceiveProps(props) {

      if (props.id !== this.props.id) {
         if (props.tagType === "hash") {
            this.getHashTagData(props.id);
         }
         if (props.tagType === "mention") {
            this.getMentionData(props.id);
         }
         this.setState({
            loading: true
         })
      }
   }

   getMentionData = (id) => {
      let params = {
         id: id
      }
      Apimanager.getMentionDetails(
         params,
         (success) => {
            if (
               success &&
               success.data
            ) {
               this.setState({
                  loading: false,
                  data: success.data.data
               })
            }
         },
         (error) => {
            //swal("Something went wrong!", 'There is some server error, Please try after some time.', "error")
         }
      );
   }

   getHashTagData = (id) => {
      let params = {
         id: id
      }
      Apimanager.getHashTagDetails(
         params,
         (success) => {
            if (
               success &&
               success.data
            ) {
               this.setState({
                  loading: false,
                  data: success.data.data
               })
            }

         },
         (error) => {
            //swal("Something went wrong!", 'There is some server error, Please try after some time.', "error")
         }
      );
   }

   getHideDetailsScreen = () => {
      this.props.closeDetails()
   }

   getMediaOpen = (obj, fline) => {
      this.props.openMediaView(obj, fline)
   }


   render() {

      let contentData = ""

      if (this.state.data && this.state.data.length > 0) {
         contentData = this.state.data.map((list, index) => {
            var firstline = list.title;
            var description = list.subTitle;

            let replaceTag;

            let newMentionArray = [];

            if (list.mentions && list.mentions.length > 0) {

               list.mentions.map((mention) => {

                  let strLength = mention.name.length + 1;

                  var result = '';
                  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                  var charactersLength = characters.length;
                  for (var i = 0; i < strLength; i++) {
                     result += characters.charAt(Math.floor(Math.random() * charactersLength));
                  }
                  let numArr = [];

                  numArr[result] = ` <span class="other-link" style="background-color:#EAF1F0;color:#21876F">@${mention.name}</span> `;
                  newMentionArray = [...newMentionArray, numArr];


                  //firstline = firstline.substring(0, mention.start) + <span style="color:#add8e6;cursor:pointer">${mention.name}</span> + firstline.substring(strLength);
                  if (mention.isForTitle) {
                     firstline = firstline.replace(firstline.substr(mention.start, strLength), result)

                  } else {
                     //console.log("description.substr(mention.start, strLength)", description.substr(mention.start, strLength))
                     if (description) {
                        description = description.replace(description.substr(mention.start, strLength), result)
                     }

                  }
                  return true;

               })

            }

            if (newMentionArray.length > 0) {
               newMentionArray.map((str, index) => {
                  firstline = firstline.replace(Object.keys(str)[0], str[Object.keys(str)[0]])
                  if (description) {
                     description = description.replace(Object.keys(str)[0], str[Object.keys(str)[0]])
                  }

                  return true;

               })
            }


            //return;

            if (list.tags && list.tags.length > 0) {
               replaceTag = list.tags.map((mTag) => {

                  return {
                     id: mTag.id,
                     name: mTag.name
                  }

               })

               if (replaceTag) {
                  replaceTag.map((newTag) => {
                     //tag.map((newTag) => {
                     let newHashTag = newTag.name.replace(/_/g, ' ');
                     firstline = firstline.replace(new RegExp(`#${newTag.name}`, 'g'), ` <span class="other-link" style="color:#008DD0">${newHashTag}</span> `)
                     if (description) {
                        description = description.replace(new RegExp(`#${newTag.name}`, 'g'), ` <span class="other-link" style="color:#008DD0">${newHashTag}</span> `)
                     }

                     //})
                     return true;
                  })
               }
            }
            return (
               <div className="card card-new" key={index}>
                  <div className="card-header">
                     <div className="recent-hash-multiple">
                        <ul>
                           <li className="card">
                              <div className="details-tag">
                                 <div className="user-icon">{reverseString(
                                    list.addedByName && list.addedByName.match(/\b(\w)/g).join("")
                                 )}</div>
                                 <div className="user-content">
                                    <div className="user-left">
                                       <div className="usr-name">{list.addedByName}</div>
                                       {/* <div className="user-adderess">{"NA"}</div> */}
                                       <div className="user-adderess"></div>
                                    </div>
                                 </div>
                              </div>

                              <div className="hashtag-block">
                                 <h6>{ReactHtmlParser(firstline)}</h6>
                                 {list.type === "media"
                                    ? <div className="main-media-tag"> <img src={list.thumbnail} onClick={() => this.getMediaOpen(list, firstline)} style={{ cursor: "pointer" }} alt="media" ></img>
                                       <div className="child-icon-tag">
                                          {list.fileType && list.fileType.includes("image") ?
                                             <img src="/assets/images/activity4.svg" onClick={() => this.getMediaOpen(list, firstline)} style={{ cursor: "pointer" }} alt="icon"></img> : ""
                                          }
                                          {list.fileType && list.fileType.includes("video") ?
                                             <img src="/assets/images/activity1.svg" onClick={() => this.getMediaOpen(list, firstline)} style={{ cursor: "pointer" }} alt="icon"></img> : ""
                                          }
                                          {list.fileType && list.fileType.includes("audio") ?
                                             <img src="/assets/images/audio.svg" onClick={() => this.getMediaOpen(list, firstline)} style={{ cursor: "pointer" }} alt="icon" ></img> : ""
                                          }
                                          {list.fileType && list.fileType.includes("pdf") ?
                                             <img src="/assets/images/activity3.svg" onClick={() => this.getMediaOpen(list, firstline)} style={{ cursor: "pointer" }} alt="icon" ></img> : ""
                                          }
                                          {list.fileType && list.fileType.includes("text") ?
                                             <img src="/assets/images/activity2.svg" onClick={() => this.getMediaOpen(list, firstline)} style={{ cursor: "pointer" }} alt="icon" ></img> : ""
                                          }

                                       </div>

                                    </div> :
                                    <p>
                                       {ReactHtmlParser(description)}
                                    </p>
                                 }

                              </div>
                           </li>
                        </ul>
                     </div>
                  </div>
               </div>

            )
         })
      }


      return (
         <>
            {this.state.loading ?
               <LoadingIndicator />
               :
               <div className="col-xl-8">
                  <div className="activity">
                     <div className="search-result recent-hastag-search">
                        <div className="header-tag-mention">
                           {/* <span className="tag-mention-icon">#</span> */}
                           {this.props.headerName && this.props.headerName.indexOf("@") ?
                              <p style={{ color: "#008DD0" }}>{this.props.headerName}</p>
                              :
                              <p style={{ "background-color": "#EAF1F0", color: "#21876F" }}>{this.props.headerName}</p>
                           }

                           <div className="pos-shift">
                              <button
                                 type="button"
                                 className="close"
                                 // data-dismiss="modal"
                                 aria-label="Close"
                                 id="close-add-tocare-team"
                                 onClick={() => this.getHideDetailsScreen()}
                              >
                                 <span aria-hidden="true">&times;</span>
                              </button>
                           </div>
                        </div>
                        <div className="hashtag-header-fix">
                           {contentData}
                        </div>
                     </div>
                  </div>
               </div>
            }

         </>
      )
   }
}
export default MentionDetails;