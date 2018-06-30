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
import {MatSnackBar} from '@angular/material';
import {SkuComponent} from './sku/sku.component';

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
  isLoggedIn: false;
  skuSearch = 0;

  constructor(private _worker: WorkerService, public dialog: MatDialog, public snackBar: MatSnackBar) {
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
        this.openSnackBar();
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

  lookUpSku() {
    const sku = this._worker.lookUpSku(this.skuSearch).subscribe(next => {
      this.openSkuLookupDialog(next);
    });
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
    this._worker.generate(this.userName);
  }

  logout() {
    this._worker.logout();
    this.userName = 'anon';
    this.snackBar.open('You are logged out', '', {
      duration: 500
    });
  }

  makeToast() {
    if (this.userName === 'anon') {
      M.toast({html: 'Please Login'});
    }
  }

  openSnackBar() {
    this.snackBar.open('Please Login.', '', {
      duration: 500
    });
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '550px',
      data: {},
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openSkuLookupDialog(data: any) {
    console.log('open sku dialog has been called and is starting...');
    const dialogRef = this.dialog.open(SkuComponent, {
      width: '550px',
      data: {number: data.number, person: data.person}
    });
  }


  handleClickedLogin() {
    if (this.isLoggedIn) {
      this.snackBar.open('You\'re already logged in', '', {duration: 500});
    } else {
      this.openLoginDialog();
    }
  }
}

// @Component({
//   selector: 'app-snack-bar-component-example-snack',
//   template: `<h4>Please Login.</h4>`,
//   styles: [`.example-pizza-party { color: hotpink; }`],
// })
// export class SnackbarComponent {}
