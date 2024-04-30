import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomersType } from '../models/northwind/customers-type';
import { NorthwindService } from '../services/northwind.service';
import { IRowSelectionEventArgs, IgxDialogComponent, IgxGridComponent } from '@infragistics/igniteui-angular';

export interface Address {
  city: FormControl<string | null>,
  country: FormControl<string | null>
}

export interface Customer {
  customerId: FormControl<string | null>,
  companyName: FormControl<string | null>,
  contactName: FormControl<string | null>,
  contactTitle: FormControl<string | null>,
  address: FormGroup<Address>
}

@Component({
  selector: 'app-master-view',
  templateUrl: './master-view.component.html',
  styleUrls: ['./master-view.component.scss']
})
export class MasterViewComponent implements OnInit {
  @ViewChild('grid', { read: IgxGridComponent, static: true }) public grid: IgxGridComponent;
  @ViewChild('formUpdate', { read: IgxDialogComponent, static: true }) public dialog: IgxDialogComponent;
  @ViewChild('form', { read: IgxDialogComponent, static: true }) public dialog1: IgxDialogComponent;
  public northwindCustomers: CustomersType[] = [];
  public customer!: FormGroup<Customer>;
  public errorMessage: string = '';

  constructor(private northwindService: NorthwindService) {
    this.customer = new FormGroup<Customer>({
      customerId: new FormControl(''),
      companyName: new FormControl('', Validators.required),
      contactName: new FormControl('', Validators.pattern("^[a-zA-Z]+( [a-zA-Z]+)*$")),
      contactTitle: new FormControl('', Validators.required),
      address: new FormGroup<Address>({
        city: new FormControl('', Validators.required),
        country: new FormControl('', Validators.required)
      }),
    })
  }

  ngOnInit() {
    this.northwindService.getCustomers().subscribe({
      next: (data) => this.northwindCustomers = data,
      error: (_err: any) => this.northwindCustomers = []
    });
  }

  public handleRowSelection(event: IRowSelectionEventArgs) {
    if (event.newSelection) {
      this.customer.patchValue(event.newSelection[0]);
      this.dialog.open();
    }
  }

  public onFormOpen() {
    this.customer.reset();
    this.dialog1.open();
  }

  private fetchCustomers(): void {
    this.northwindService.getCustomers().subscribe({
      next: (data) => this.northwindCustomers = data,
      error: (_err: any) => this.northwindCustomers = []
    });
  }

  private resetForm(): void {
    this.customer.reset();
    this.errorMessage = '';
  }

  private handleResponse(response: any): void {
    console.log('Operation successful:', response);
    this.fetchCustomers(); // Update customer list
    this.resetForm();
    this.dialog.close();
    this.dialog1.close();
  }

  private handleError(error: any): void {
    console.error('Error:', error);
    if (error.error) {
      this.errorMessage = Object.values(error.error).join('\n');
    } else {
      this.errorMessage = error.message || 'An error occurred.';
    }
  }

  onSubmit(): void {
    if (this.customer.valid) {
      const myCustomerId = this.customer.value.customerId;
      const myCompanyName = this.customer.value.companyName;
      const myEditedContactName = this.customer.value.contactName;
      const myContactTitle = this.customer.value.contactTitle;
      const myAddressCity = this.customer.value.address?.city;
      const myAddressCountry = this.customer.value.address?.country;

      if (myEditedContactName !== undefined && myEditedContactName !== null && myCompanyName !== undefined && myContactTitle !== undefined &&
        myAddressCity !== undefined && myAddressCountry !== undefined && myCustomerId !== undefined) {
        const updatedCustomer: CustomersType = {
          customerID: myCustomerId,
          companyName: myCompanyName,
          contactName: myEditedContactName,
          contactTitle: myContactTitle,
          address: {
            city: myAddressCity,
            country: myAddressCountry,
            street: '',
            region: '',
            postalCode: '',
            phone: ''
          }
        };

        this.northwindService.updateCustomer(updatedCustomer).subscribe({
          next: (response) => this.handleResponse(response),
          error: (error) => this.handleError(error)
        });
      }
    } else {
      // Handle invalid form state
      this.errorMessage = 'Please provide valid data for all fields.';
    }
  }

  onAddNewCustomer(): void {
    if (this.customer.valid) {
      const myCustomerId = this.customer.value.customerId;
      const myCompanyName = this.customer.value.companyName;
      const myEditedContactName = this.customer.value.contactName;
      const myContactTitle = this.customer.value.contactTitle;
      const myAddressCity = this.customer.value.address?.city;
      const myAddressCountry = this.customer.value.address?.country;

      if (myEditedContactName !== undefined && myEditedContactName !== null && myCompanyName !== undefined && myContactTitle !== undefined &&
        myAddressCity !== undefined && myAddressCountry !== undefined && myCustomerId !== undefined) {
        const newCustomer: CustomersType = {
          customerID: myCustomerId,
          companyName: myCompanyName,
          contactName: myEditedContactName,
          contactTitle: myContactTitle,
          address: {
            city: myAddressCity,
            country: myAddressCountry,
            street: '',
            region: '',
            postalCode: '',
            phone: ''
          }
        };

        this.northwindService.addCustomer(newCustomer).subscribe({
          next: (response) => this.handleResponse(response),
          error: (error) => this.handleError(error)
        });
      }
    } else {
      // Handle invalid form state
      this.errorMessage = 'Please provide valid data for all fields.';
    }
  }

  onDelete(): void {
    if (this.customer.valid) {
      const myCustomerId = this.customer.value.customerId;

      if (myCustomerId !== null && myCustomerId !== undefined) {
        this.northwindService.deleteCustomer(myCustomerId).subscribe({
          next: (response) => this.handleResponse(response),
          error: (error) => this.handleError(error)
        });
      }
    } else {
      // Handle invalid form state
      this.errorMessage = 'Please provide valid data for all fields.';
    }
  }
}
