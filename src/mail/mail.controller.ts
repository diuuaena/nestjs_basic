import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { SubscriberDocument } from 'src/subscribers/schemas/subscriber.schema';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailerService: MailerService,
    @InjectModel(Subscriber.name) private readonly subscriberModel: SoftDeleteModel<SubscriberDocument>,
    @InjectModel(Job.name) private readonly jobModel: SoftDeleteModel<JobDocument>,
  ) { }

  @Get()
  @Public()
  @ResponseMessage("Test email")
  //@Cron("0 5 0 * * 0") //0.00 AM every sunday
  async handleTestEmail() {

    const subscribers = await this.subscriberModel.find({});
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.jobModel.find({ skills: { $in: subsSkills } });
      if (jobWithMatchingSkills?.length) {
        const jobs = jobWithMatchingSkills.map(item => {
          return {
            name: item.name,
            company: item.company,
            salary: `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + "VND",
            skill: item.skills
          }
        })

        await this.mailerService.sendMail({
          to: "phongnq1@runsystem.net",
          from: '"Support Team" <support@example.com>', // override default from
          subject: 'Welcome to Nice App! Confirm your Email',
          //html: '<b>welcome bla test test test bla</b>', // HTML body content
          template: "new-job",
          context: {
            receiver: subs.name,
              jobs: jobs
          }
        });
      }
    }

  }

}
