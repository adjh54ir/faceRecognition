
import React, { useEffect, useState, useRef } from "react";
import waterfall from '../images/waterfall.jpg'
// import { FaceMesh } from "@mediapipe/face_mesh";
// import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

/**
 * MediaPipe 기반의 selfie_segmentation, face_mesh 솔루션 컴포넌트 
 * @author jonghoon_lee
 * @note 
 * 초기 화면을 띄워줘야 한다.
 */
export const MediaPipeComponent = () => {

    const { Camera, SelfieSegmentation, FaceMesh, drawConnectors, controls } = window;
    const { FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_RIGHT_EYEBROW, FACEMESH_LEFT_EYE, FACEMESH_LEFT_EYEBROW, FACEMESH_FACE_OVAL, FACEMESH_LIPS } = window;

    const canvasWidth = 600;
    const canvasHeight = 500;

    const videoRefence = useRef(null);
    
    const canvasReference = useRef(null);
    const imgReference = useRef(null);

    const [canvasList, setCanvasList] = useState(null);

    /**
     * [init] 화면 렌더링 이후 수행
     */
    useEffect(() => {
        _fn_initCavasSetting();     // 캔버스 생성 세팅
    }, []);



    /**
     * Vidio 출력개수 세팅
     */
    const _fn_initCavasSetting = async() =>{

        let canvasListArr = [];

        // 캔버스 생성 개수 
        let canvasCnt = 1;

        for(let i = 0 ; i < canvasCnt ; i++){

            canvasListArr.push(
                <td>
                    <h3>{i+1}번 Canvas</h3>
                    <canvas
                        ref={canvasReference}
                        width={canvasWidth+"px"}
                        height={canvasHeight+"px"} />
                </td>
            );
        }

        setCanvasList(canvasListArr);

    }


    const _fn_totalSetSelfiCam = async () => {
        await _fn_initSetSelfiCam();
    }

    /**
     * [기능] 태그 기준으로 웹캠을 킴
     */
    const _fn_initSetSelfiCam = async () => {

        const videoTag = document.getElementsByTagName('video');

        // selfieSegmentation 세팅 
        const selfieSegmentation = await new SelfieSegmentation({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`;
            }
        });

        /**
         * modelSelection [0] : 지정되지 않은 값
         * modelSelection [1] : 가로형 모델을 사용
         */

        await selfieSegmentation.setOptions({
            modelSelection: 0,
        });

        for (const videoItem of videoTag) {

            // 비디오 안보이게 하기 
            videoItem.style.display = "none";
            let camera = await new Camera(videoItem, {
                onFrame: async () => {
                    await selfieSegmentation.send({ image: videoItem });
                },
                width: canvasWidth,
                height: canvasHeight
            });
            camera.start();
        }
        // [함수호출] 반복적으로 캔버스를 그리는것을 수행
        await selfieSegmentation.onResults(_fn_selfiSegOnResults);
    }

    /**
     * [기능] 신체분절화 화면 그려주기 기능
     * @param {*} results 
     * 
     * @option Canvas.getContext(); 옵션 설명
     * "2d"
     * "webgl" (또는 "experimental-webgl")
     * "webgl2"
     * "bitmaprenderer"
     * 
     * @option Canvas.getContext().globalCompositeOperation 옵션 설명
     * source-in : 대상값과 겹쳐진 부분만, 즉 나중에 그려진 도형의 겹쳐지는 부분만 표시 됨
     * source-out : 대상값이 겹쳐지지 않은 부분만,즉 나중에 그려진 도형에서 겹쳐지지 않는 부분만 표시 됨
     * destination-atop : 대상 그림과 겹쳐진 부분만, 즉 나중에 그려진 도형 영역만 표시 -> 겹쳐진 부분은 처음 그려진 도형이 표시
     */
    const _fn_selfiSegOnResults = async (results) => {
        console.log("canvas");
        const canvasTag = document.getElementsByTagName('canvas');

        for (let canvasItem of canvasTag) {


             /**
              * [option1]
              * fillRect: 직사각형을 그림
              * strokeRect: 직사각형의 윤곽선을 그림
              * clearRect: 특정 부분을 지우는 직사각형
              * 
              * [option2]
              * fillStyle = color: 도형을 채우는 색을 설정
              * strokeStyle = color: 도형의 윤곽선 색을 설정
              */

            if( canvasItem.getContext){
                console.log(results);
                let ctx = canvasItem.getContext('2d');

                ctx.save();
                // STEP1: 신체 분리 수행
                ctx.clearRect(0, 0, canvasItem.width, canvasItem.height);
                ctx.globalCompositeOperation = 'source-out';
                ctx.drawImage(results.segmentationMask, 0, 0, canvasItem.width, canvasItem.height);     //results.segmentationMask 에 위에 사항을 그려줌
                
                
                // ctx.filter = "blur(5px)";
                ctx.globalAlpha  = 1.0
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvasItem.width, canvasItem.height);
                ctx.globalCompositeOperation = 'destination-atop';
                ctx.drawImage(results.image, 0, 0, canvasItem.width, canvasItem.height);

                ctx.restore();
            } else {
                 // canvas unsupported code here

                alert("사용 불능");
            }
            
        }


    }






    // ================================================================================================================================================================================
    /**
     * [기능] faceMesh 솔루션 기반의 초기 세팅
     */
    const _fn_initSetFaceMesh = async () => {
        const videoTag = document.getElementsByTagName('video');

        const faceMesh = await new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });


        /**
         * maxNumFaces: 감지할 최대 얼굴 수(default: 1)
         * minDetectionConfidence: 탐지에 성공한 것으로 간주되는 얼굴 탐지 모델의 최소 신뢰 값(default: 0.5)
         * minTrackingConfidence: 얼굴 랜드마크가 성공적으로 추적된 것으로 간주되는 랜드마크 추적 모델의 최소 신뢰 값(default: 0.5)
         */
        faceMesh.setOptions({
            maxNumFaces: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        await faceMesh.onResults(_fn_faceMeshOnResults);

        for (const videoItem of videoTag) {

            // 비디오 안보이게 하기 
            videoItem.style.display = "none";
            let camera = await new Camera(videoItem, {
                onFrame: async () => {
                    await faceMesh.send({ image: videoRefence.current });
                },
                width: canvasWidth,
                height: canvasHeight
            });
            camera.start();
        }

    }

    /**
     * [기능] 얼굴인식 관련 화면 그려주기 기능
     * @param {*} results 
     */
    const _fn_faceMeshOnResults = async (results) => {
        const canvasTag = document.getElementsByTagName('canvas');
        for (let canvasItem of canvasTag) {

            let canvasCtx = canvasItem.getContext('2d');

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasItem.width, canvasItem.height);
            canvasCtx.drawImage(
                results.image, 0, 0, canvasItem.width, canvasItem.height);
            if (results.multiFaceLandmarks) {
                for (const landmarks of results.multiFaceLandmarks) {
                    drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,
                        { color: '#C0C0C070', lineWidth: 1 });
                    drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, { color: '#FF3030' });
                    drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#FF3030' });
                    drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, { color: '#30FF30' });
                    drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, { color: '#30FF30' });
                    drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, { color: '#E0E0E0' });
                    drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: '#E0E0E0' });
                }
            }
            canvasCtx.restore();
        }


    }

    // ============================================================================================================================================================
    return (
        <>
            <div className="container">

                <button
                    type="button"
                    onClick={() => _fn_totalSetSelfiCam()}>화면 뒷배경 변환 버튼</button>
                <button
                    type="button"
                    onClick={() => _fn_initSetFaceMesh()}>얼굴인식 버튼</button>

                <br/>
                <br/>
                <table>
                    <img src={waterfall} alt="daekyo" style={{display:"none"}} ref={imgReference} />
                    <tr>
                        <td colSpan={canvasList === null ? 1 : canvasList.length}>
                            Canvas
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <video
                                ref={videoRefence}
                            />
                        </td>
                        {canvasList}
                    </tr>
                </table>
            </div>

        </>
    )

}
export default MediaPipeComponent;