import * as THREE from '../../libs/three128/three.module.js';
import { GLTFLoader } from '../../libs/three128/GLTFLoader.js';
import { RGBELoader } from '../../libs/three128/RGBELoader.js';
import { NPCHandler } from './NPCHandler.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { Pathfinding } from '../../libs/pathfinding/Pathfinding.js';
import { User } from './User.js';
import { Controller } from './Controller.js';
import './Eventos.js';
import {Elementos} from './Elementos.js';



class Game{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
		this.clock = new THREE.Clock();

        this.loadingBar = new LoadingBar();
        this.loadingBar.visible = false;

		this.assetsPath = '../../assets/';
        
		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 500 );
		this.camera.position.set( -5, 1.6, -1.46 );
		this.camera.rotation.y = -Math.PI*0.5;
		

		let col = 0x000000;
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( col );
		this.scene.fog = new THREE.Fog( col, 100, 200 );

		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
		this.scene.add(ambient);

        const light = new THREE.DirectionalLight();
        light.position.set( 4, 20, 20 );
		light.target.position.set(-2, 0, 0);
		light.castShadow = true;
		//Set up shadow properties for the light
		light.shadow.mapSize.width = 1024; 
		light.shadow.mapSize.height = 512; 
		light.shadow.camera.near = 0.5; 
		light.shadow.camera.far = 50;
		const d = 30; 
		light.shadow.camera.left = -d;
		light.shadow.camera.bottom = -d*0.25;
		light.shadow.camera.right = light.shadow.camera.top = d;
		this.scene.add(light);
		this.light = light;
	
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.shadowMap.enabled = true;
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
		container.appendChild( this.renderer.domElement );
        this.setEnvironment();
		


		this.load();

		this.raycaster = new THREE.Raycaster();
		this.tmpVec = new THREE.Vector3();
		
		window.addEventListener( 'resize', this.resize.bind(this) );

		this.arcadeM=this.elementos.arcade;
		//this.evento();

	}

	seeUser(pos, seethrough=false){
		if (this.seethrough){
			this.seethrough.forEach( child => {
				child.material.transparent = false;
				child.material.opacity = 1;
				//child.visible = true;
			});
			delete this.seethrough;
		}

		this.tmpVec.copy(this.user.position).sub(pos).normalize();
		this.raycaster.set(pos, this.tmpVec);

		const intersects = this.raycaster.intersectObjects(this.factory.children, true);
		let userVisible = true;

		if (intersects.length>0){
			const dist = this.tmpVec.copy(this.user.position).distanceTo(pos);
			
			if (seethrough){
				this.seethrough = [];
				intersects.some( intersect => {
					if (intersect.distance < dist){
						this.seethrough.push(intersect.object);
						//intersect.object.visible = false;
						intersect.object.material.transparent = true;
						intersect.object.material.opacity = 0.3;
					}else{
						return true;
					}
				})
			}else{
				userVisible = (intersects[0].distance > dist);
			}
			
		}

		return userVisible;
	}

	initPathfinding(navmesh){
		this.waypoints = [
			new THREE.Vector3(17.73372016326552, 0.39953298254866443, -0.7466724607286782),
			new THREE.Vector3(20.649478054772402, 0.04232912113775987, -18.282935518174437),
			new THREE.Vector3(11.7688416798274, 0.11264635905666916, -23.23102176233945),
			new THREE.Vector3(-3.111551689570482, 0.18245423057147991, -22.687392486867505),
			new THREE.Vector3(-13.772447796604245, 0.1260277454451636, -23.12237117145656),
			new THREE.Vector3(-20.53385139415452, 0.0904175187063471, -12.467546107992108),
			new THREE.Vector3(-18.195950790753532, 0.17323640676321908, -0.9593366354062719),
			new THREE.Vector3(-6.603208729295872, 0.015786387893574227, -12.265553884212125)
		];
		this.pathfinder = new Pathfinding();
        this.pathfinder.setZoneData('factory', Pathfinding.createZone(navmesh.geometry, 0.02));
		//if (this.npcHandler.gltf !== undefined) this.npcHandler.initNPCs();
	}
	
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight ); 
    }
    
    setEnvironment(){
        const loader = new RGBELoader().setDataType( THREE.UnsignedByteType ).setPath(this.assetsPath);
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
        
        loader.load( 'hdr/factory.hdr', 
		texture => {
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();

          this.scene.environment = envMap;

		  this.loadingBar.visible = !this.loadingBar.loaded;
        }, 
		xhr => {
			this.loadingBar.update( 'envmap', xhr.loaded, xhr.total );
		},
		err => {
            console.error( err.message );
        } );
    }
    
	load(){
        this.loadEnvironment();
		//this.npcHandler = new NPCHandler(this);
		//this.user = new User(this, new THREE.Vector3( -5.97, 0.021, -1.49), 1.57)
		this.user = new User(this, new THREE.Vector3(0, 0, 0), 1.57);

		//this.eventos=new Eventos(this);
		this.elementos=new Elementos(this);
		
//cargando HTML PARA JUEGO
		const msg_play = document.getElementById('arcade');
		msg_play.style.display="none";
		msg_play.style.visibility = "hidden";
		
		const arc_container = document.getElementById('arc_container');
		arc_container.style.display="none";
		arc_container.style.visibility = "hidden";
	
		
		
    }

    loadEnvironment(){
    	const loader = new GLTFLoader( ).setPath(`${this.assetsPath}factory/`);
        
        this.loadingBar.visible = true;
		
		// Load a glTF resource
		loader.load(
			// resource URL
			'garage.glb',
			// called when the resource is loaded
			gltf => {

				this.scene.add( gltf.scene );
                this.factory = gltf.scene;
				this.fans = [];

				const mergeObjects = {elements2:[], elements5:[], terrain:[]};

				gltf.scene.traverse( child => {
					if (child.isMesh){
						if (child.name == 'NavMesh'){
							this.navmesh = child;
							//this.navmesh.geometry.rotateX( Math.PI/2 );
							this.navmesh.quaternion.identity();
							this.navmesh.position.set(0,0,0);
							child.material.visible = false;

						}
						child.castShadow = true;
						child.receiveShadow = true;
					}
				});

				this.scene.add(this.navmesh);

				this.controller = new Controller(this);

                this.renderer.setAnimationLoop( this.render.bind(this) );

				this.initPathfinding(this.navmesh);

				this.loadingBar.visible = !this.loadingBar.loaded;
			},
			// called while loading is progressing
			xhr => {

				this.loadingBar.update('environment', xhr.loaded, xhr.total);
				
			},
			// called when loading has errors
			err => {

				console.error( err );

			}
		);
	}			
    
	startRendering(){
		if ( this.user.ready && this.eventos == undefined){
			this.controller = new Controller(this);
			//this.eventos = new Eventos(this);
			this.renderer.setAnimationLoop( this.render.bind(this) );
            this.loadingBar.visible = false;
			
		}
		
	}
    
	evento(){
		console.log("activar arcade game");
		document.getElementById('body').style.backgroundColor="gray";

		const msg_play = document.getElementById('arcade');
		msg_play.style.display = "flex";
		msg_play.style.visibility= "visible";

		



	}
	
	render() {
		const dt = this.clock.getDelta();
				if (this.user !== undefined ) this.user.update(dt);
		if (this.controller !== undefined) this.controller.update(dt);

        this.renderer.render( this.scene, this.camera );

		this.update(dt);
		


			

    }

	update(dt){
		
		const p0 = this.user.position.z;
		const p1 = this.arcadeM.position.z;
		const AM_act = (p0-p1)
		
		if (Math.abs(AM_act)<1){
			this.evento();
			this.user.position.z= this.user.position.z+0.5;
			

		}
		
	}
}

export { Game };