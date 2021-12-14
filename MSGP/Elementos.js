import * as THREE from '../../libs/three128/three.module.js';

class Elementos{
    constructor(game){

		this.game = game;
//ARCADE MACHINE
		const geometry = new THREE.CylinderGeometry( 0.5,0.5,2,16 );
        const material = new THREE.MeshStandardMaterial( { color: 0xFF0000 });
        this.arcade = new THREE.Mesh( geometry, material );
        this.arcade.position.set(12.133023880664181, 1.8831807305434332, -14.33041088532442);
		this.arcade.material.visible=false;
	
		

       

        this.load();

       

    }

	
    load(){
	this.game.scene.add(this.arcade);
  
	}

   
	

	// update(dt){
	// 	if (this.mixer) this.mixer.update(dt);
		
		
    // }
}

export { Elementos };