import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-datapicker',
  templateUrl: './datapicker.component.html',
  styleUrls: ['./datapicker.component.css']
})
export class DatapickerComponent implements OnInit {
  @Input() minDate!: Date;
  @Input() maxDate!: Date;
  @Output() dateRangeSelected = new EventEmitter<{startDate: Date, endDate: Date}>();

  dateRange!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.dateRange = this.fb.group({
      startDate: [''],
      endDate: ['']
    });

    this.dateRange.valueChanges.subscribe(val => {
      if (val.startDate && val.endDate) {
        this.dateRangeSelected.emit({
          startDate: val.startDate,
          endDate: val.endDate
        });
      }
    });
  }
}