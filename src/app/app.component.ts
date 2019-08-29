import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Animals, Prediction } from './prediction';
import * as tf from '@tensorflow/tfjs';
import { pad1d } from '@tensorflow/tfjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  animals = Animals;
  model: any;
  output: any;
  predictions: Prediction[] = [];
  percentages: number[];
  imageSrc = '';
  animalPrediction: string;

  @ViewChild('img', {static: false}) imageEl: ElementRef;

  constructor() { }

  async ngOnInit() {
    this.model = await tf.loadLayersModel('../assets/tfjs_model_5/model.json');
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
    this.predictions = [];
    this.animalPrediction = '';
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (res: any) => {
        this.imageSrc = res.target.result;
        setTimeout(async () => {
          const imgEl = this.imageEl.nativeElement;
          this.output = await this.model.predict(this.preprocess(imgEl));
          this.percentages = Array.from(this.output.dataSync());
          this.createPredArr();
          this.findMax(this.percentages);
        }, 0);

      };
    }
  }

  findMax(arr: number[]) {
    const index = this.percentages.indexOf(Math.max(...arr));
    this.animalPrediction = this.animals[index]
  }

  createPredArr() {
    for(let i = 0; i < this.animals.length; i++) {
      this.percentages[i] = this.percentages[i] * 100;
      let pred = { animal: this.animals[i], percentage: this.percentages[i]};
      this.predictions.push(pred);
    }

    this.predictions.sort((p1, p2) => p2.percentage - p1.percentage);
  }


}
