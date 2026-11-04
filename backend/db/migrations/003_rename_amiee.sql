-- The name is spelled Amiee, not Amie. Rename the stored names and their checks together.
-- Older migrations keep the old spelling because they have already run.

alter table members drop constraint if exists members_display_name_check;
alter table letters drop constraint if exists letters_author_check;
alter table milestones drop constraint if exists milestones_author_check;
alter table love_notes drop constraint if exists love_notes_author_check;
alter table events drop constraint if exists events_author_check;

update members set display_name = 'Amiee' where display_name = 'Amie';
update letters set author = 'Amiee' where author = 'Amie';
update milestones set author = 'Amiee' where author = 'Amie';
update love_notes set author = 'Amiee' where author = 'Amie';
update events set author = 'Amiee' where author = 'Amie';

alter table members add constraint members_display_name_check check (display_name is null or display_name in ('Ben', 'Amiee'));
alter table letters add constraint letters_author_check check (author in ('Ben', 'Amiee'));
alter table milestones add constraint milestones_author_check check (author in ('Ben', 'Amiee'));
alter table love_notes add constraint love_notes_author_check check (author in ('Ben', 'Amiee'));
alter table events add constraint events_author_check check (author in ('Ben', 'Amiee'));
