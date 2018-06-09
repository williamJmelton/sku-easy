import {Component, OnInit, ViewChild, AfterViewInit, EventEmitter, Inject} from '@angular/core';
import {ElementRef} from '@angular/core';
import {WorkerService} from '../../worker.service';
import * as M from '../../../../node_modules/materialize-css/dist/js/materialize.js';
import {interval, Observable} from 'rxjs';
import {throttle} from 'rxjs/operators';
import {fromEvent} from 'rxjs';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {LoginComponent} from '../login/login.component';
import {MatTableDataSource, MatPaginator} from '@angular/material';
import {Sku} from '../../models/Sku';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  // @ViewChild('button') button: ElementRef;
  @ViewChild('button', {read: ElementRef}) private button: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  skus: any;
  newestSku: number;
  userName: string;
  login_name: string;
  login_password: string;
  clicks$: Observable<any>;
  displayedColumns = ['number', 'name', 'time'];
  dataSource: MatTableDataSource<Sku> = new MatTableDataSource([]);
  isLoggedIn: boolean;

  constructor(private _worker: WorkerService, public dialog: MatDialog) {
    this.userName = 'anon';
    this._worker.getUserName().subscribe(data => {
      this.userName = data;
    });
  }

  ngAfterViewInit() {
    this.clicks$ = fromEvent(this.button.nativeElement, 'click');
    this.clicks$.pipe(throttle(val => interval(3000))).subscribe(click => {
      console.log('click!');
      if (this.userName !== 'anon') {
        this.generate();
      } else {
        console.log('Must be logged in!');
      }
    });
  }

  ngOnInit() {
    this.getNewestSku();
    this.getSkus();
    console.log('button element is', this.button.nativeElement);
    this._worker.getAuth().subscribe(auth => {
      this.isLoggedIn = auth;
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getNewestSku() {
    this._worker.getSkuNumbers().subscribe(data => {
      this.newestSku = Math.max(...data);
    });
  }

  getSkus() {
    this._worker.getSkus().subscribe((skus) => {
      this.skus = skus;
      this.dataSource = new MatTableDataSource(this.skus);
      this.dataSource.paginator = this.paginator;
      console.log(this.dataSource);
    });
  }

  generate() {
    this._worker.generate(this.newestSku, this.userName);
  }

  logout() {
    this._worker.logout();
    this.userName = 'anon';
    M.toast({html: 'You are logged out'});
  }

  makeToast() {
    if (this.userName === 'anon') {
      M.toast({html: 'Please Login'});
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '550px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
