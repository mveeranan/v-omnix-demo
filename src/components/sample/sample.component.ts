import { JsonPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ɵInternalFormsSharedModule, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-sample',
  standalone: true,
  imports: [ɵInternalFormsSharedModule, ReactiveFormsModule, NgIf],
  templateUrl: './sample.component.html',
  styleUrl: './sample.component.scss'
})
export class SampleComponent implements OnInit  {

   userInfoForm! : FormGroup;
   formData : any;

  constructor(private fb: FormBuilder) {

    this.userInfoForm = this.fb.group({
      name : ['',Validators.required],
      email : ['',[Validators.email,Validators.required]],
      password : ['',Validators.required,Validators.minLength(6)],
      confirmPassword : ['',Validators.required,Validators.minLength(6)],
    })
   }



  ngOnInit(): void {
  }

  userformSubmit(){
    if(!this.userInfoForm.valid){{
          this.userInfoForm.markAllAsTouched();
          return;
    }
  }

  this.formData.push(this.userInfoForm.value);
  console.log(this.formData);
}

}
