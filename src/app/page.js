'use client';
import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

// Render
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

import style from 'styles/page.module.scss';
import NavBar from 'components/Layouts/NavBar/page';

const Home = () => {
  // Handle Dark or Light Mode
  const [darkMode, setDarkMode] = useState(false);

  // Color
  const white_color = '#f8f8ff';
  const black_color = '#1c1c1c';

  useEffect(() => {}, [darkMode]);

  const world = {
    // initial color
    initialColorGui: {
      Red: 0,
      Green: 0,
      Blue: 0.4,
    },
    // color when hover
    hoverColorGui: {
      Red: 0,
      Green: 0,
      Blue: 1,
    },
  };

  useEffect(() => {
    //--------------------------------------------------+
    //
    // Canva - Scene
    //
    //--------------------------------------------------+

    const canvas = document.querySelector('#webgl');

    const scene = new THREE.Scene();

    // Background color update on dark mode toggle
    scene.background = new THREE.Color(darkMode ? white_color : black_color);

    //--------------------------------------------------+
    //
    // Geometry
    //
    //--------------------------------------------------+

    // Check if screen width is less than 1000px
    const isMobile = window.innerWidth < 1000;

    // Plane
    var PlaneWidth = 400;
    var PlaneHeight = 400;
    var PlaneWidthSegments = 50;
    var PlaneHeightSegments = 50;

    if (isMobile) {
      PlaneWidth = 50;
      PlaneHeight = 50;
      PlaneWidthSegments = 10;
      PlaneHeightSegments = 10;
    }

    // Create Plane geometry
    var planeGeometry = new THREE.PlaneGeometry(
      PlaneWidth,
      PlaneHeight,
      PlaneWidthSegments,
      PlaneHeightSegments
    );
    planeGeometry = mergeVertices(planeGeometry);
    planeGeometry.computeTangents();

    // Create Plane material
    const planeMaterial = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      flatShading: true,
      vertexColors: true,
    });
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(planeMesh);

    // Function to Generate Plane Geometry
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

      // Set initial color based on dark mode
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

    //--------------------------------------------------+
    //
    // Lights
    //
    //--------------------------------------------------+

    const light = new THREE.DirectionalLight('white', 1);
    light.position.set(0, 1, 1);
    scene.add(light);

    const backLight = new THREE.DirectionalLight('white', 1);
    backLight.position.set(0, 0, -1);
    scene.add(backLight);

    //--------------------------------------------------+
    //
    // Sizes
    //
    //--------------------------------------------------+

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    };

    window.addEventListener('resize', () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(sizes.pixelRatio);
    });

    //--------------------------------------------------+
    //
    // Camera
    //
    //--------------------------------------------------+

    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );

    // Camera Position
    camera.position.set(0, 0, 50);
    scene.add(camera);

    //--------------------------------------------------+
    //
    // Renderer
    //
    //--------------------------------------------------+

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });

    // width / height
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    //--------------------------------------------------+
    //
    // Mouse event
    //
    //--------------------------------------------------+

    const raycaster = new THREE.Raycaster();
    const mouse = { x: undefined, y: undefined };

    window.addEventListener('mousemove', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    //--------------------------------------------------+
    //
    // Post-processing
    //
    //--------------------------------------------------+

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass();
    bloomPass.strength = 1.5;
    bloomPass.radius = 0.5;
    bloomPass.threshold = 0.8;
    composer.addPass(bloomPass);

    // ------------------------------+
    //
    //        Animation Loop
    //
    // ------------------------------+

    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;

      // Plane vertex animation
      const { array, originalPosition, randomValues } =
        planeMesh.geometry.attributes.position;
      for (let i = 0; i < array.length; i += 3) {
        array[i] =
          originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01;
        array[i + 1] =
          originalPosition[i + 1] + Math.sin(frame + randomValues[i]) * 0.001;
      }
      planeMesh.geometry.attributes.position.needsUpdate = true;

      // Raycaster interaction
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(planeMesh);

      if (intersects.length > 0) {
        const { color } = intersects[0].object.geometry.attributes;
        // color when not hover
        // color when not hover
        const initialColor = {
          r: world.initialColorGui.Red,
          g: world.initialColorGui.Green,
          b: world.initialColorGui.Blue,
        };
        // color when hover
        const hoverColor = {
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
  }, []);

  return (
    <div
      className={`${style.global_container} ${
        darkMode ? style.dark : style.light
      }`}
    >
      {/* 3D Container */}
      <canvas className={style.webgl} id="webgl"></canvas>

      {/* Page Content */}

      {/* Navigation Bar */}
      <NavBar
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />
    </div>
  );
};

export default Home;
