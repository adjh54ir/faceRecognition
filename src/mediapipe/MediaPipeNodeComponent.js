
// import React, { useEffect, useState } from "react";
// import { FaceMesh } from "@mediapipe/face_mesh";
// import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

// import { CameraUtil } from '@mediapipe/camera_utils';
// import { ControlUtils } from '@mediapipe/control_utils';
// import { DrawingUtils } from '@mediapipe/drawing_utils';


// /**
//  * MediaPipe 기반의 selfie_segmentation, face_mesh 솔루션 컴포넌트 
//  * @author jonghoon_lee
//  */
// export const MediaPipeNodeComponent = () => {

//     const [video, setVideo] = useState(null);
//     const [canvas, setCanvas] = useState(null);
//     const [canvasCtx, setCanvasCtx] = useState(null);

//     /**
//      * [init] 화면 렌더링 이후 수행
//      */
//     useEffect(() => {
//         const initSetting = async () => {
//             await _fn_initTagSet();           // 초기 태그 정보 세팅
//             await _fn_initSetSelfiSeg();      // 신체 분절화 솔루션 관련 초기 세팅 
//             await _fn_initSetFaceMesh();      // facemesh 솔루션 관련 초기 세팅
//         };
//         initSetting();
//     }, []);


//     /**
//      * [기능] 태그 엘리먼트 관련 세팅 
//      */
//     const _fn_initTagSet = async () => {
//         const videoElement = document.getElementsByClassName('input_video')[0];
//         const canvasElement = document.getElementsByClassName('output_canvas')[0];
//         const canvasCtxElement = canvasElement.getContext('2d');
//         setVideo(videoElement);
//         setCanvas(canvasElement);
//         setCanvasCtx(canvasCtxElement);
//     }

//     /**
//      * [기능] selfieSegmentation 솔루션 기반의 초기 세팅
//      */
//     const _fn_initSetSelfiSeg = async () => {

//         const selfieSegmentation = await new SelfieSegmentation({
//             locateFile: (file) => {
//                 return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
//             }
//         });

//         await selfieSegmentation.setOptions({
//             modelSelection: 1,
//         });

//         await selfieSegmentation.onResults(_fn_selfiSegOnResults);

//         const camera = await new CameraUtil(video, {
//             onFrame: async () => {
//                 await selfieSegmentation.send({ image: video });
//             },
//             width: 1280,
//             height: 720
//         });
//         await camera.start();
//     }


//     /**
//      * [기능] faceMesh 솔루션 기반의 초기 세팅
//      */
//     const _fn_initSetFaceMesh = async () => {
//         const faceMesh = await new FaceMesh({
//             locateFile: (file) => {
//                 return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
//             }
//         });
//         faceMesh.setOptions({
//             maxNumFaces: 1,
//             minDetectionConfidence: 0.5,
//             minTrackingConfidence: 0.5
//         });
//         await faceMesh.onResults(_fn_faceMeshOnResults);

//         const camera = await new CameraUtil(video, {
//             onFrame: async () => {
//                 await faceMesh.send({ image: video });
//             },
//             width: 1280,
//             height: 720
//         });
//         await camera.start();

//     }


//     /**
//      * [기능] 신체분절화 화면 그려주기 기능
//      * @param {*} results 
//      */
//     const _fn_selfiSegOnResults = async (results) => {

//         canvasCtx.save();
//         canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
//         canvasCtx.drawImage(results.segmentationMask, 0, 0,
//             canvas.width, canvas.height);

//         // Only overwrite existing pixels.
//         canvasCtx.globalCompositeOperation = 'source-in';
//         canvasCtx.fillStyle = '#00FF00';
//         canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

//         // Only overwrite missing pixels.
//         canvasCtx.globalCompositeOperation = 'destination-atop';
//         canvasCtx.drawImage(
//             results.image, 0, 0, canvas.width, canvas.height);

//         canvasCtx.restore();
//     }


//     /**
//      * [기능] 얼굴인식 관련 화면 그려주기 기능
//      * @param {*} results 
//      */
//     const _fn_faceMeshOnResults = async (results) => {
//         canvasCtx.save();
//         canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
//         canvasCtx.drawImage(
//             results.image, 0, 0, canvas.width, canvas.height);
//         if (results.multiFaceLandmarks) {
//             for (const landmarks of results.multiFaceLandmarks) {
//                 DrawingUtils.drawConnectors(canvasCtx, landmarks, ControlUtils.FACEMESH_TESSELATION,
//                     { color: '#C0C0C070', lineWidth: 1 });
//                     DrawingUtils.drawConnectors(canvasCtx, landmarks, ControlUtils.FACEMESH_RIGHT_EYE, { color: '#FF3030' });
//                     DrawingUtils.drawConnectors(canvasCtx, landmarks, ControlUtils.FACEMESH_RIGHT_EYEBROW, { color: '#FF3030' });
//                     DrawingUtils.drawConnectors(canvasCtx, landmarks, ControlUtils.FACEMESH_LEFT_EYE, { color: '#30FF30' });
//                     DrawingUtils.drawConnectors(canvasCtx, landmarks, ControlUtils.FACEMESH_LEFT_EYEBROW, { color: '#30FF30' });
//                     DrawingUtils.drawConnectors(canvasCtx, landmarks, ControlUtils.FACEMESH_FACE_OVAL, { color: '#E0E0E0' });
//                     DrawingUtils.drawConnectors(canvasCtx, landmarks, ControlUtils.FACEMESH_LIPS, { color: '#E0E0E0' });
//             }
//         }
//         canvasCtx.restore();

//     }


//     return (
//         <>
//             <div className="container">
//                 <video className="input_video" />
//                 <canvas className="output_canvas" width="1280px" height="720px" />
//             </div>

//         </>
//     )

// }
// export default MediaPipeNodeComponent;