import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-label-horizontal',
  templateUrl: './label-horizontal.component.html',
  styleUrls: ['./label-horizontal.component.css']
})
export class LabelHorizontalComponent implements OnInit {

  @Input() required = false;
  @Input() noColon = false;
  @Input() for!: string;
  @Input() span = "8";
  @Input() classLabel!: string;
  @Input() content!: string;
  @Input() isFilterList = false;
  @Input() isVisibilityLabel = false;

  constructor() { }

  ngOnInit(){
  }

}
