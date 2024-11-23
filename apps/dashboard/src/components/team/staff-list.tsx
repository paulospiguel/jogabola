import { Button } from "@repo/ui/components/button";
import { Save, Plus, Send, Trash2, Repeat2 } from "@repo/ui/icons";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useState } from "react";

interface Staff {
	id: number;
	name: string;
	role: string;
	invited: boolean;
}

interface StaffListProps {
	staff: Staff[];
	hasEditPermission: boolean;
	addStaffMember: (name: string, role: string) => void;
	toggleInvite: (id: number) => void;
	removeStaffMember: (id: number) => void;
}

interface AddStaffFormInputs {
	name: string;
	role: string;
}

const StaffList: React.FC<StaffListProps> = ({
	staff,
	hasEditPermission,
	addStaffMember,
	toggleInvite,
	removeStaffMember,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const onClose = () => {
		setIsOpen(false);
	};

	const { register, handleSubmit, reset } = useForm<AddStaffFormInputs>();

	const onSubmit: SubmitHandler<AddStaffFormInputs> = (data) => {
		addStaffMember(data.name, data.role);
		reset();
		onClose();
	};

	return (
		<>
			<div className="w-full bg-white shadow-md rounded-lg overflow-hidden mb-4">
				<div className="bg-primary py-2">
					<div className="text-lg font-semibold text-white flex items-center justify-center">Comissão Técnica</div>
				</div>
				<div className="p-4">
					{hasEditPermission && (
						<Button onClick={() => addStaffMember("Novo Membro", "Função")} className="mb-4">
							<Plus className="h-4 w-4 mr-2" /> Adicionar Membro
						</Button>
					)}
					<ul className="space-y-4">
						{staff.map((member) => (
							<li key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
								<div>
									<p className="font-semibold">{member.name}</p>
									<p className="text-sm text-gray-600">{member.role}</p>
								</div>
								<div className="flex items-center space-x-2">
									{member.invited && (
										<Button variant="outline" size="sm" onClick={() => toggleInvite(member.id)}>
											<Send className="h-4 w-4 mr-1" /> Convidar
										</Button>
									)}
									{hasEditPermission && (
										<>
											<Button variant="outline" size="sm" onClick={() => toggleInvite(member.id)}>
												<Repeat2 className="h-4 w-4 mr-1" /> Reenviar
											</Button>
											<Button variant="outline" size="sm" onClick={() => removeStaffMember(member.id)}>
												<Trash2 className="h-4 w-4 mr-1" /> Remover
											</Button>
										</>
									)}
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Adicionar Membro da Staff</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="name" className="text-right">
									Nome
								</Label>
								<Input {...register("name")} placeholder="Nome" id="name" className="col-span-3" required />
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="role" className="text-right">
									Função
								</Label>
								<Input {...register("role")} placeholder="Função" id="role" className="col-span-3" required />
							</div>
						</div>
						<div className="flex justify-end">
							<Button type="submit">
								<Save className="h-4 w-4 mr-1" /> Salvar
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default StaffList;
