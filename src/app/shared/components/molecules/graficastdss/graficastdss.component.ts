import { Component, OnInit } from '@angular/core';

import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-graficastdss',
  templateUrl: './graficastdss.component.html',
  styleUrl: './graficastdss.component.css'
})
export class GraficastdssComponent implements OnInit {

  public chart: any;

  ngOnInit(): void {
    this.createChart();
  }


  createChart(){
  
    this.chart = new Chart("MyChart", {
      type: 'line', //this denotes tha type of chart

      data: {// values on X-Axis
        labels: ['2022-05-10', 
                 '2022-05-11', 
                 '2022-05-12',
                 '2022-05-13',
								 '2022-05-14',
                 '2022-05-15', 
                 '2022-05-16',
                 '2022-05-17', 
                ], 
	       datasets: [
          {
            label: "Sales",
            data: ['467','576', '572', '79', '92','574', '573', '576'],
            backgroundColor: 'red'
          },
          {
            label: "Profit",
            data: ['542', '542', '536', '327', '17','0.00', '538', '541'],
            backgroundColor: 'yellow'
          }  
        ]
      },
      options: {
        aspectRatio:2.5
      }
      
    });
  }
}
