import { ContactComponent } from './pages/contact.component';
import { DetailsComponent } from './pages/details.component';
import { AboutComponent } from './pages/about.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VizComponent } from './viz/viz.component';

const routes: Routes = [
  { path: '', component: VizComponent },
  { path: 'about', component: AboutComponent },
  { path: 'details/:id', component: DetailsComponent },
  { path: 'contact', component: ContactComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
