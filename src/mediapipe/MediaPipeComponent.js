
import React, { useEffect, useState, useRef } from "react";

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

    // let cameraArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    let cameraArr = [1, 2, 3, 4, 5, 6, 7, 8];

    const canvasWidth = 600;
    const canvasHeight = 400;

    const videoRefence = useRef(null);
    const canvasReference = useRef(null);

    /**
     * [init] 화면 렌더링 이후 수행
     */
    useEffect(() => {
    }, []);

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
        await selfieSegmentation.setOptions({
            modelSelection: 1,
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
        console.log("error point1");
        const canvasTag = document.getElementsByTagName('canvas');

        for (let canvasItem of canvasTag) {
            console.log("error point2");

            let ctx = canvasItem.getContext('2d');
            // let ctx = canvasItem.getContext('webgl2')


            ctx.save();
            ctx.clearRect(0, 0, canvasWidth, canvasWidth);

            ctx.drawImage(results.segmentationMask, 0, 0, canvasWidth, canvasWidth);

            ctx.globalCompositeOperation = 'source-out';
            // canvasChg.filter = "blur(5px)";
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(0, 0, canvasWidth, canvasWidth);

            ctx.globalCompositeOperation = 'destination-atop';
            ctx.drawImage(results.image, 0, 0, canvasWidth, canvasWidth);

            ctx.restore();
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
        faceMesh.setOptions({
            maxNumFaces: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        await faceMesh.onResults(_fn_faceMeshOnResults);

        for (const videoItem of videoTag) {

            // 비디오 안보이게 하기 
            // videoItem.style.display = "none";
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
            canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            canvasCtx.drawImage(
                results.image, 0, 0, canvasWidth, canvasHeight);
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
                    onClick={() => _fn_totalSetSelfiCam()}> SelfieSegmentation Button</button>
                <button
                    type="button"
                    onClick={() => _fn_initSetFaceMesh()}>얼굴인식 버튼</button>

                <table>
                    {
                        cameraArr.map((item) => {
                            return (
                                <>
                                    <tr id={item}>
                                        <td>
                                            Video{item}
                                        </td>
                                        <td>
                                            Canvas{item}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <video
                                                ref={videoRefence}
                                            />
                                        </td>
                                        <td>
                                            <canvas
                                                ref={canvasReference}
                                                width={canvasWidth}
                                                height={canvasHeight} />
                                        </td>
                                    </tr>
                                </>
                            )
                        })
                    }



                </table>

            </div>

        </>
    )

}
export default MediaPipeComponent;