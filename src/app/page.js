'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

import style from 'styles/page.module.scss';
import { useTheme } from '@/context/ThemeContext.js';

import NavBar from 'components/Layouts/NavBar/page.js';
import SectionAccueil from 'components/Sections/SectionAccueil/page.js';
import SectionDescription from 'components/Sections/SectionDescription/page.js';
import Loader from 'components/Layouts/Loading_Page/page.js';
import MusicSection from '@/components/Sections/MusicSection/page';
import SectionAlbum from '@/components/Sections/SectionAlbum';
import SectionArtist from '@/components/Sections/SectionArtist';
import SectionFiltre from '@/components/Sections/SectionFiltre/page';
import SectionSearch from '@/components/Sections/SectionSearch/page';
import SectionSearchBar from '@/components/Sections/SectionSearchBar/page';
import MusicSectionMulti from '@/components/Sections/MultiMusicSection/page';

// import { useTranslation } from 'next-i18next';

// function testHusky() {
//      const test = 'pas de guillemets simples';
//       var mauvaisVar = 123;
//         console.log(test)
//   return mauvaisVar;
// }
const Home = () => {
  const { darkMode } = useTheme();
  const { isLoading, setLoader } = useTheme();
  const { sectionName } = useTheme();

  const { isExpanded } = useTheme();

  const darkModeRef = useRef(darkMode);
  const [isMusicMulti, setIsMusicMulti] = useState(false);

  const toggleMusicSection = () => {
    setIsMusicMulti((prev) => !prev);
  };
  useEffect(() => {
    darkModeRef.current = darkMode;
  }, [darkMode]);

  useEffect(() => {
    let rgbColor;
    let rgbColorHover;

    if (darkModeRef.current) {
      rgbColor = 2;
      rgbColorHover = [0, 2];
    } else {
      rgbColor = 0.05;
      rgbColorHover = [1, 2];
    }

    const world = {
      initialColorGui: { Red: rgbColor, Green: rgbColor, Blue: rgbColor },
      hoverColorGui: {
        Red: 0,
        Green: rgbColorHover[0],
        Blue: rgbColorHover[1],
      },
    };

    const canvas = document.querySelector('#webgl');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8f8ff');

    const isMobile = window.innerWidth < 1000;
    let PlaneWidth = 300,
      PlaneHeight = 300,
      PlaneWidthSegments = 30,
      PlaneHeightSegments = 30;

    if (isMobile) {
      PlaneWidth = 50;
      PlaneHeight = 100;
      PlaneWidthSegments = 8;
      PlaneHeightSegments = 8;
    }

    let planeGeometry = new THREE.PlaneGeometry(
      PlaneWidth,
      PlaneHeight,
      PlaneWidthSegments,
      PlaneHeightSegments
    );
    planeGeometry = mergeVertices(planeGeometry);
    planeGeometry.computeTangents();

    const planeMaterial = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      flatShading: true,
      vertexColors: true,
    });
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(planeMesh);

    const generatePlane = () => {
      planeMesh.geometry.dispose();
      planeMesh.geometry = new THREE.PlaneGeometry(
        PlaneWidth,
        PlaneHeight,
        PlaneWidthSegments,
        PlaneHeightSegments
      );
      const { array } = planeMesh.geometry.attributes.position;
      const randomValues = [];
      for (let i = 0; i < array.length; i++) {
        if (i % 3 === 0) {
          array[i] += (Math.random() - 0.5) * 2;
          array[i + 1] += (Math.random() - 0.5) * 2;
          array[i + 2] += (Math.random() - 0.5) * 3;
        }
        randomValues.push(Math.random() * Math.PI * 4);
      }
      planeMesh.geometry.attributes.position.randomValues = randomValues;
      planeMesh.geometry.attributes.position.originalPosition = array;

      const colors = [];
      for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
        colors.push(
          world.initialColorGui.Red,
          world.initialColorGui.Green,
          world.initialColorGui.Blue
        );
      }
      planeMesh.geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(new Float32Array(colors), 3)
      );
    };

    generatePlane();

    const light = new THREE.DirectionalLight('white', 1);
    light.position.set(0, 1, 1);
    scene.add(light);

    const backLight = new THREE.DirectionalLight('white', 1);
    backLight.position.set(0, 0, -1);
    scene.add(backLight);

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    };

    window.addEventListener('resize', () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(sizes.pixelRatio);
    });

    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(0, 0, 50);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    const raycaster = new THREE.Raycaster();
    const mouse = { x: undefined, y: undefined };

    window.addEventListener('mousemove', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass();
    bloomPass.strength = 1.5;
    bloomPass.radius = 0.5;
    bloomPass.threshold = 0.8;
    composer.addPass(bloomPass);

    let frame = 0;
    let lastFrameTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (time) => {
      requestAnimationFrame(animate);

      const deltaTime = time - lastFrameTime;
      if (deltaTime < frameInterval) {
        return;
      }

      lastFrameTime = time;
      frame += 0.01;

      const { array, originalPosition, randomValues } =
        planeMesh.geometry.attributes.position;
      for (let i = 0; i < array.length; i += 3) {
        array[i] =
          originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.005;
        array[i + 1] =
          originalPosition[i + 1] + Math.sin(frame + randomValues[i]) * 0.0005;
      }
      planeMesh.geometry.attributes.position.needsUpdate = true;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(planeMesh);
      if (intersects.length > 0) {
        const { color } = intersects[0].object.geometry.attributes;
        let initialColor = {
          r: world.initialColorGui.Red,
          g: world.initialColorGui.Green,
          b: world.initialColorGui.Blue,
        };
        let hoverColor = {
          r: world.hoverColorGui.Red,
          g: world.hoverColorGui.Green,
          b: world.hoverColorGui.Blue,
        };
        gsap.to(hoverColor, {
          r: initialColor.r,
          g: initialColor.g,
          b: initialColor.b,
          duration: 1,
          onUpdate: () => {
            ['a', 'b', 'c'].forEach((key) => {
              const faceIndex = intersects[0].face[key];
              color.setX(faceIndex, hoverColor.r);
              color.setY(faceIndex, hoverColor.g);
              color.setZ(faceIndex, hoverColor.b);
              color.needsUpdate = true;
            });
          },
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      planeGeometry.dispose();
      planeMaterial.dispose();
      renderer.dispose();
      composer.dispose();
    };
  }, [darkMode]);

  return (
    <div
      className={`${style.global_container} ${darkMode ? style.dark : style.light}`}
    >
      <canvas className={style.webgl} id="webgl"></canvas>
      {isLoading ? (
        <Loader setLoader={setLoader} />
      ) : (
        <>
          {!isExpanded && <NavBar />}
          <div className={style.app_wrapper}>
            <SectionFiltre />
            {sectionName === 'Album' && <SectionAlbum />}
            {sectionName === 'Artiste' && <SectionArtist />}
            {sectionName === 'Description' && <SectionDescription />}
            {sectionName === 'Filter' && <SectionSearch />}
            {sectionName === 'SearchBar' && <SectionSearchBar />}
            {sectionName === '' && <SectionAccueil />}

            <div className={style.music_container}>
              <button
                onClick={toggleMusicSection}
                className={style.toggle_music_mode}
                title={isMusicMulti ? 'Mode Solo' : 'Mode Multi'}
              >
                {isMusicMulti ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V18C1 18.55 1.45 19 2 19H14C14.55 19 15 18.55 15 18V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C15.05 13.06 15.06 13.08 15.07 13.09C16.21 13.92 17 15.03 17 16.5V18C17 18.35 16.93 18.69 16.82 19H22C22.55 19 23 18.55 23 18V16.5C23 14.17 18.33 13 16 13Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>

              {isMusicMulti ? <MusicSectionMulti /> : <MusicSection />}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
