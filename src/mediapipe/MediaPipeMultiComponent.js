
import React, { useEffect, useState, useRef } from "react";

export const MediaPipeMultiComponent = () =>{
    const { Camera, SelfieSegmentation, FaceMesh, drawConnectors } = window;

    const canvasWidth = 320;
    const canvasHeight = 240;
    
    const videoRefence = useRef(null);
    const canvasReference = useRef(null);
    
    const videoRefence2 = useRef(null);
    const canvasReference2 = useRef(null);


    /**
     * [init] 화면 렌더링 이후 수행
     */
    useEffect(() => {
    }, []);


    const _button_ok = async() =>{

        await _fn_initSetSelfiCam1();
        await _fn_initSetSelfiCam2();
    }

    /**
     * [기능] 태그 기준으로 웹캠을 킴
     */
    const _fn_initSetSelfiCam1 = async () => {

        // selfieSegmentation 세팅 
        const selfieSegmentation = await new SelfieSegmentation({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
            }
        });
        await selfieSegmentation.setOptions({
            modelSelection: 1,
        });

        // [함수호출] 반복적으로 캔버스를 그리는것을 수행
        await selfieSegmentation.onResults(_fn_selfiSegOnResult1);

        const video = videoRefence.current;

        // 비디오 안보이게 하기 
        // videoItem.style.display = "none";
        let camera = await new window.Camera(video, {
            onFrame: async () => {
                await selfieSegmentation.send({ image: video });
            },
            width: canvasWidth,
            height: canvasHeight
        });
        camera.start();
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
    const _fn_selfiSegOnResult1 = async (results) => {

        const canvasChg = canvasReference.current.getContext('2d');

        canvasChg.save();
        canvasChg.clearRect(0, 0, canvasWidth, canvasWidth);
        canvasChg.drawImage(results.segmentationMask, 0, 0, canvasWidth, canvasWidth);

        canvasChg.globalCompositeOperation = 'source-out';
        canvasChg.fillStyle = '#00FF00';
        canvasChg.fillRect(0, 0, canvasWidth, canvasWidth);

        canvasChg.globalCompositeOperation = 'destination-atop';
        canvasChg.drawImage(results.image, 0, 0, canvasWidth, canvasWidth);

        canvasChg.restore();
    }

    // ==========================================================================================================================================
    /**
     * [기능] 태그 기준으로 웹캠을 킴
     */
    const _fn_initSetSelfiCam2 = async () => {

        // selfieSegmentation 세팅 
        const selfieSegmentation = await new SelfieSegmentation({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
            }
        });
        await selfieSegmentation.setOptions({
            modelSelection: 1,
        });

        // [함수호출] 반복적으로 캔버스를 그리는것을 수행
        await selfieSegmentation.onResults(_fn_selfiSegOnResult2);

        const video = videoRefence2.current;

        // 비디오 안보이게 하기 
        // videoItem.style.display = "none";
        let camera = await new window.Camera(video, {
            onFrame: async () => {
                await selfieSegmentation.send({ image: video });
            },
            width: canvasWidth,
            height: canvasHeight
        });
        camera.start();
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
    const _fn_selfiSegOnResult2 = async (results) => {

        const canvasChg = canvasReference2.current.getContext('2d');

        canvasChg.save();
        canvasChg.clearRect(0, 0, canvasWidth, canvasWidth);
        canvasChg.drawImage(results.segmentationMask, 0, 0, canvasWidth, canvasWidth);

        canvasChg.globalCompositeOperation = 'source-out';
        canvasChg.fillStyle = '#00FF00';
        canvasChg.fillRect(0, 0, canvasWidth, canvasWidth);

        canvasChg.globalCompositeOperation = 'destination-atop';
        canvasChg.drawImage(results.image, 0, 0, canvasWidth, canvasWidth);

        canvasChg.restore();
    }



    return (
        <>
            <button
                    type="button"
                    onClick={() => _button_ok()}> SelfieSegmentation Button</button>
            <video
                ref={videoRefence}
            />
            <canvas
                ref={canvasReference}
                width={canvasWidth}
                height={canvasHeight} />

            <video
                ref={videoRefence2}
            />
            <canvas
                ref={canvasReference2}
                width={canvasWidth}
                height={canvasHeight} />

        </>
    )
} 
export default MediaPipeMultiComponent;