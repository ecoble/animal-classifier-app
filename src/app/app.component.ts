import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  animals = ['butterfly', 'cat', 'chicken', 'cow', 'dog', 'elephant', 'horse', 'sheep', 'spider', 'squirrel'];
  model: any;
  output: any;
  predictions = [];
  imageSrc = '';
  animalPrediction: string;

  @ViewChild('img', {static: false}) imageEl: ElementRef;

  constructor() { }

  async ngOnInit() {
    this.model = await tf.loadLayersModel('../assets/tfjs_model/model.json');
  }

  preprocess(img: ImageData) {
      let tensor = tf.browser.fromPixels(img)
      const resized = tf.image.resizeBilinear(tensor, [200, 200]).toFloat()
      const offset = tf.scalar(255.0);
      const normalized = tf.scalar(1.0).sub(resized.div(offset));
      const batched = normalized.expandDims(0)
      return batched
  }

  async fileChange(event) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (res: any) => {
        this.imageSrc = res.target.result;
        setTimeout(async () => {
          const imgEl = this.imageEl.nativeElement;
          this.output = await this.model.predict(this.preprocess(imgEl));
          this.predictions = Array.from(this.output.dataSync());
          this.findMax(this.predictions.concat());
        }, 0);

      };
    }
  }

  findMax(arr: number[]) {
    const index = this.predictions.indexOf(arr.sort()[arr.length - 1]);
    this.animalPrediction = this.animals[index]
    console.log(this.predictions);
  }


}
