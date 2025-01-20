'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

import style from 'styles/page.module.scss';
import NavBar from 'components/Layouts/NavBar/page.js';
import SectionAccueil from 'components/Sections/SectionAccueil/page.js';
import SectionDescription from 'components/Sections/SectionDescription/page.js';
import Loader from 'components/Layouts/Loading_Page/page.js';
import { useTheme } from '@/app/ThemeContext.js';

// import { useTranslation } from 'next-i18next';

const Home = () => {
  const { darkMode } = useTheme();
  const { isLoading, setLoader } = useTheme();
  const { sectionName } = useTheme();

  // const { t } = useTranslation('common');

  const darkModeRef = useRef(darkMode);

  useEffect(() => {
    darkModeRef.current = darkMode;
  }, [darkMode]);

  useEffect(() => {
    let rgbColor;
    let rgbColorHover;

    if (darkModeRef.current) {
      rgbColor = 2;
      rgbColorHover = [0, 1];
    } else {
      rgbColor = 0.04;
      rgbColorHover = [0.8, 2];
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
      PlaneWidthSegments = 20;
      PlaneHeightSegments = 20;
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
          array[i] += (Math.random() - 0.5) * 3;
          array[i + 1] += (Math.random() - 0.5) * 3;
          array[i + 2] += (Math.random() - 0.5) * 5;
        }
        randomValues.push(Math.random() * Math.PI * 2);
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
          originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01;
        array[i + 1] =
          originalPosition[i + 1] + Math.sin(frame + randomValues[i]) * 0.001;
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
          <NavBar />
          <div className={style.app_wrapper}>
            {sectionName != '' ? <SectionDescription /> : <SectionAccueil />}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
