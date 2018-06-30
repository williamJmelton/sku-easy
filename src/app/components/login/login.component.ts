import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

import {WorkerService} from '../../worker.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username = 'emad';
  password = 'emad2018';

  constructor(
    public dialogRef: MatDialogRef<LoginComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _worker: WorkerService) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  login() {
    this._worker.login(this.username, this.password);
    this.onNoClick();
  }

  ngOnInit() {}

}
