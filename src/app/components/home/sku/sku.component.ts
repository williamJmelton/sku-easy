import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-sku',
  templateUrl: './sku.component.html',
  styleUrls: ['./sku.component.scss']
})
export class SkuComponent implements OnInit {
  sku: any;

  constructor(public dialogRef: MatDialogRef<SkuComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log('component data is:', data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {

  }

}
